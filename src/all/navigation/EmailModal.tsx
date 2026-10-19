import { useEffect, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Mail, ExternalLink, Send, Copy, Check, X } from 'lucide-react';
import {
  buildGmailComposeUrl,
  buildOutlookComposeUrl,
  buildYahooComposeUrl,
  buildMailtoUrl,
  buildFullDraftText,
  copyToClipboard,
} from './contactConfig';

export interface EmailModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly email: string;
  readonly subject?: string;
  readonly body?: string;
  readonly onActionClick?: () => void;
}

/**
 * EmailModalContent Component
 *
 * Senior-level mounted dialog providing universal email dispatch options:
 * 1. Safe default mail launcher with automatic clipboard copy fallback.
 * 2. Direct webmail compose links (Gmail, Outlook, Yahoo Mail) for systems without native clients.
 * 3. 1-click clipboard copy for email address and message drafts.
 * 4. 100% compliant with W3C WAI-ARIA Dialog (Modal) specification:
 *    - Focus trap (Tab / Shift+Tab cycling)
 *    - Focus restoration to the trigger on close
 *    - Body scroll lock during display
 *    - Escape key dismissal
 */
export function EmailModalContent({
  onClose,
  email,
  subject,
  body,
  onActionClick,
}: Omit<EmailModalProps, 'isOpen'>) {
  const [copied, setCopied] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [defaultMailStatus, setDefaultMailStatus] = useState<'idle' | 'triggered'>('idle');

  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tempLinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Focus management & body scroll lock
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;

    const focusTimer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 15);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(focusTimer);
      document.body.style.overflow = originalOverflow;
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  // Cleanup feedback timers on unmount
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
      if (tempLinkTimerRef.current) clearTimeout(tempLinkTimerRef.current);
    };
  }, []);

  // Escape key & Tab Focus Trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Copy email handler
  const handleCopy = async () => {
    const success = await copyToClipboard(email);
    if (success) {
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 2400);
    }
  };

  // Copy full draft handler (Subject + Body)
  const handleCopyDraft = async () => {
    const fullDraft = buildFullDraftText(email, { subject, body });
    const success = await copyToClipboard(fullDraft);
    if (success) {
      setCopiedDraft(true);
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
      draftTimerRef.current = setTimeout(() => setCopiedDraft(false), 2400);
    }
  };

  const gmailUrl = buildGmailComposeUrl(email, { subject, body });
  const outlookUrl = buildOutlookComposeUrl(email, { subject, body });
  const yahooUrl = buildYahooComposeUrl(email, { subject, body });
  const mailtoUrl = buildMailtoUrl(email, { subject, body });

  // Safe Default Mail handler:
  // 1. Copies recipient email to clipboard as a guaranteed fallback.
  // 2. Dispatches mailto URL via temporary element.
  // 3. Displays feedback status with webmail fallbacks.
  const handleDefaultMail = async (e: React.MouseEvent) => {
    e.preventDefault();

    const copySuccess = await copyToClipboard(email);
    if (copySuccess) {
      setCopied(true);
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopied(false), 3000);
    }

    setDefaultMailStatus('triggered');

    try {
      const tempLink = document.createElement('a');
      tempLink.href = mailtoUrl;
      tempLink.style.position = 'fixed';
      tempLink.style.left = '-9999px';
      tempLink.style.top = '-9999px';
      tempLink.setAttribute('aria-hidden', 'true');
      document.body.appendChild(tempLink);
      tempLink.click();
      tempLinkTimerRef.current = setTimeout(() => {
        if (document.body.contains(tempLink)) {
          document.body.removeChild(tempLink);
        }
      }, 500);
    } catch {
      window.location.href = mailtoUrl;
    }
  };

  return (
    <div
      className="nav-email-modal-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={modalRef}
        className="nav-email-modal-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="email-modal-title"
        aria-describedby="email-modal-desc"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="nav-email-modal-header">
          <div className="nav-email-modal-title-group">
            <div className="nav-email-modal-icon-badge" aria-hidden="true">
              <Mail size={18} />
            </div>
            <div>
              <h4 id="email-modal-title" className="nav-email-modal-title">
                Send an Email
              </h4>
              <p id="email-modal-desc" className="nav-email-modal-desc">
                Choose how you want to compose or copy
              </p>
            </div>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="nav-email-modal-close-btn"
            onClick={onClose}
            aria-label="Close email options dialog"
          >
            <X size={18} strokeWidth={2.2} stroke="currentColor" color="currentColor" />
          </button>
        </div>

        {/* Quick Email Address Box (Single native button — eliminates nested interactive controls) */}
        <button
          type="button"
          className="nav-email-modal-address-box"
          onClick={handleCopy}
          aria-label={copied ? 'Email address copied to clipboard' : `Copy email address ${email} to clipboard`}
          title={copied ? 'Copied to clipboard!' : 'Click to copy email address'}
        >
          <div className="nav-email-modal-address-info">
            <span className="nav-email-modal-address-label">email</span>
            <span className="nav-email-modal-address-val">{email}</span>
          </div>
          <span
            className={`nav-email-modal-copy-btn ${copied ? 'is-copied' : ''}`}
            aria-hidden="true"
          >
            {copied ? (
              <>
                <Check size={14} />
                <span>copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>copy</span>
              </>
            )}
          </span>
          <span className="sr-only" aria-live="polite">
            {copied ? 'Email address copied to clipboard' : ''}
          </span>
        </button>

        {/* Options List */}
        <div className="nav-email-modal-options" role="list" aria-label="email compose options">
          {/* Option 1: Gmail */}
          <a
            href={gmailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-email-modal-option-card"
            onClick={() => {
              onClose();
              onActionClick?.();
            }}
            role="listitem"
            aria-label="Compose in Gmail Web (opens in new tab)"
          >
            <div className="nav-email-option-icon-box" aria-hidden="true">
              <Mail size={18} />
            </div>
            <div className="nav-email-option-content">
              <span className="nav-email-option-name">Gmail</span>
            </div>
            <ExternalLink size={16} className="nav-email-option-arrow" aria-hidden="true" />
          </a>

          {/* Option 2: Outlook */}
          <a
            href={outlookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-email-modal-option-card"
            onClick={() => {
              onClose();
              onActionClick?.();
            }}
            role="listitem"
            aria-label="Compose in Outlook Live (opens in new tab)"
          >
            <div className="nav-email-option-icon-box" aria-hidden="true">
              <Mail size={18} />
            </div>
            <div className="nav-email-option-content">
              <span className="nav-email-option-name">Outlook</span>
            </div>
            <ExternalLink size={16} className="nav-email-option-arrow" aria-hidden="true" />
          </a>

          {/* Option 3: Yahoo Mail */}
          <a
            href={yahooUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-email-modal-option-card"
            onClick={() => {
              onClose();
              onActionClick?.();
            }}
            role="listitem"
            aria-label="Compose in Yahoo Mail (opens in new tab)"
          >
            <div className="nav-email-option-icon-box" aria-hidden="true">
              <Mail size={18} />
            </div>
            <div className="nav-email-option-content">
              <span className="nav-email-option-name">Yahoo Mail</span>
            </div>
            <ExternalLink size={16} className="nav-email-option-arrow" aria-hidden="true" />
          </a>

          {/* Option 4: Default Mail App */}
          <button
            type="button"
            className={`nav-email-modal-option-card ${defaultMailStatus === 'triggered' ? 'is-triggered' : ''}`}
            onClick={handleDefaultMail}
            role="listitem"
            aria-label="Open in default system mail client (also copies address to clipboard)"
          >
            <div className="nav-email-option-icon-box" aria-hidden="true">
              {defaultMailStatus === 'triggered' ? <Check size={18} /> : <Send size={18} />}
            </div>
            <div className="nav-email-option-content">
              <span className="nav-email-option-name">Default Mail App</span>
              {defaultMailStatus === 'triggered' && (
                <span className="nav-email-option-badge is-success">App requested · Copied!</span>
              )}
            </div>
            <ExternalLink size={16} className="nav-email-option-arrow" aria-hidden="true" />
          </button>
        </div>

        {/* Fallback Status Callout */}
        {defaultMailStatus === 'triggered' && (
          <div className="nav-email-modal-status-callout" role="status" aria-live="polite">
            <div className="nav-email-modal-status-header">
              <Check size={14} className="nav-email-status-icon" aria-hidden="true" />
              <span className="nav-email-status-title">Mail client requested</span>
            </div>
            <p className="nav-email-status-msg">
              We copied <strong>{email}</strong> to your clipboard. If no desktop mail app opened on your system, you can use <strong>Gmail</strong>, <strong>Outlook</strong>, or <strong>Yahoo Mail</strong> above.
            </p>
          </div>
        )}

        {/* Optional Full Inquiry Template Copy */}
        {body && (
          <div className="nav-email-modal-footer">
            <button
              type="button"
              className={`nav-email-modal-draft-btn ${copiedDraft ? 'is-copied' : ''}`}
              onClick={handleCopyDraft}
              aria-label={copiedDraft ? 'Inquiry template copied to clipboard' : 'Copy message template'}
            >
              {copiedDraft ? (
                <>
                  <Check size={13} aria-hidden="true" />
                  <span>Template copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} aria-hidden="true" />
                  <span>Copy message template</span>
                </>
              )}
            </button>
            <span className="sr-only" aria-live="polite">
              {copiedDraft ? 'Inquiry message template copied to clipboard' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * EmailModal Component
 *
 * Senior-level interactive modal providing universal email dispatch options:
 * 1. Webmail direct compose (Gmail Web, Outlook.com, Yahoo Mail) — bypasses missing OS mail clients.
 * 2. Standard native mailto link for desktop & mobile mail software.
 * 3. 1-click clipboard copy with accessible live feedback.
 */
export default function EmailModal(props: EmailModalProps) {
  if (!props.isOpen) return null;
  const content = <EmailModalContent {...props} />;
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(content, document.body);
  }
  return content;
}

