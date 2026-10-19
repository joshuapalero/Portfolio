import { useState, useEffect, useCallback, useRef } from 'react';
import { Mail, Calendar, ChevronRight, Copy, Check, ExternalLink } from 'lucide-react';
import type { WorkTogetherProps } from './types';
import {
  getContactConfig,
  copyToClipboard,
} from './contactConfig';
import EmailModal from './EmailModal';

/**
 * CopyEmailButton Component
 *
 * Micro-interaction component providing 1-click clipboard copy
 * with accessible announcement, transient "Copied!" feedback state,
 * and automatic cleanup.
 */
export function CopyEmailButton({
  email,
  className = '',
}: {
  email: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleCopyEmail = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      const success = await copyToClipboard(email);
      if (success) {
        setCopied(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setCopied(false);
        }, 2500);
      }
    },
    [email]
  );

  return (
    <button
      type="button"
      className={`nav-work-copy-btn ${copied ? 'is-copied' : ''} ${className}`.trim()}
      onClick={handleCopyEmail}
      aria-label={copied ? 'Email address copied to clipboard' : `Copy email address ${email} to clipboard`}
      title={copied ? 'Copied to clipboard!' : 'Copy email address'}
    >
      {copied ? (
        <Check size={14} className="nav-work-copy-icon" aria-hidden="true" />
      ) : (
        <Copy size={14} className="nav-work-copy-icon" aria-hidden="true" />
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Email address copied to clipboard' : ''}
      </span>
    </button>
  );
}

/**
 * EmailActionCard Component
 *
 * Interactive Email trigger that opens the Smart Email Modal (Gmail Web, Outlook,
 * Default App, or Copy Address) to ensure 100% universal compatibility across all
 * devices and browsers without requiring a configured OS desktop email client.
 *
 * Adheres to W3C WCAG 2.2 Level AAA: Zero nested interactive controls.
 */
export function EmailActionCard({
  email,
  emailLabel = 'email',
  subject,
  body,
  allowCopy = true,
  onActionClick,
}: {
  email: string;
  emailLabel?: string;
  subject?: string;
  body?: string;
  allowCopy?: boolean;
  onActionClick?: () => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleOpen = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    // Return focus to trigger upon modal close
    triggerRef.current?.focus();
  };

  return (
    <>
      <div className="nav-work-card nav-work-card-interactive">
        <button
          ref={triggerRef}
          type="button"
          className="nav-work-card-action-btn"
          onClick={handleOpen}
          aria-haspopup="dialog"
          aria-expanded={isModalOpen}
          aria-label={`${emailLabel}: ${email}. Open email options.`}
        >
          <div className="nav-work-card-icon-box" aria-hidden="true">
            <Mail size={18} />
          </div>

          <div className="nav-work-card-content">
            <div className="nav-work-card-meta">
              <span className="nav-work-card-tag">{emailLabel}</span>
            </div>
            <span className="nav-work-card-text" title={email}>
              {email}
            </span>
          </div>
        </button>

        {allowCopy ? (
          <CopyEmailButton email={email} />
        ) : (
          <button
            type="button"
            className="nav-work-card-arrow-btn"
            onClick={handleOpen}
            aria-hidden="true"
            tabIndex={-1}
          >
            <ChevronRight size={16} className="nav-work-card-chevron" />
          </button>
        )}
      </div>

      <EmailModal
        isOpen={isModalOpen}
        onClose={handleClose}
        email={email}
        subject={subject}
        body={body}
        onActionClick={onActionClick}
      />
    </>
  );
}

/**
 * WorkTogetherSection Component
 *
 * Senior-level collaboration CTA providing high-conversion, accessible actions:
 * 1. Email action card opening the universal compose dialog with 1-click clipboard copy.
 * 2. Schedule a Call card linking to direct booking (Calendly / Cal.com).
 * 3. Unified section label matching the Quick Hub design system.
 */
export default function WorkTogetherSection({
  title = 'Work Together',
  description = '',
  email,
  emailLabel,
  subject,
  body,
  allowCopy = true,
  callLabel,
  callText,
  callSubtext,
  callUrl,
  onActionClick,
  className = '',
}: WorkTogetherProps) {
  const config = getContactConfig();

  const activeEmail = email ?? config.email;
  const activeEmailLabel = emailLabel ?? config.emailLabel;
  const activeSubject = subject ?? config.defaultSubject;
  const activeBody = body ?? config.defaultBody;

  const activeCallLabel = callLabel ?? config.callLabel;
  const activeCallText = callText ?? config.callText;
  const activeCallSubtext = callSubtext ?? config.callSubtext;
  const activeCallUrl = callUrl ?? config.scheduleCallUrl;

  const isExternalCall = activeCallUrl.startsWith('http://') || activeCallUrl.startsWith('https://');

  return (
    <section
      className={`nav-work-together ${className}`.trim()}
      aria-label="Collaboration and hire inquiry"
    >
      <div className="nav-sidebar-section-header">
        <span className="nav-sidebar-section-label">{title}</span>
      </div>

      {description ? (
        <p className="nav-work-together-desc">{description}</p>
      ) : null}

      <div className="nav-work-cards" role="list" aria-label="contact options">
        {/* Card 1: Email */}
        <div role="listitem">
          <EmailActionCard
            email={activeEmail}
            emailLabel={activeEmailLabel}
            subject={activeSubject}
            body={activeBody}
            allowCopy={allowCopy}
            onActionClick={onActionClick}
          />
        </div>

        {/* Card 2: Schedule a Call */}
        <div role="listitem">
          <a
            href={activeCallUrl}
            target={isExternalCall ? '_blank' : undefined}
            rel={isExternalCall ? 'noopener noreferrer' : undefined}
            className="nav-work-card nav-work-card-link"
            onClick={onActionClick}
            aria-label={`${activeCallLabel}: ${activeCallText}`}
          >
            <div className="nav-work-card-icon-box" aria-hidden="true">
              <Calendar size={18} />
            </div>

            <div className="nav-work-card-content">
              <div className="nav-work-card-meta">
                <span className="nav-work-card-tag">{activeCallLabel}</span>
                {activeCallSubtext ? (
                  <span className="nav-work-card-subtext">{activeCallSubtext}</span>
                ) : null}
              </div>
              <span className="nav-work-card-text">{activeCallText}</span>
            </div>

            <ExternalLink size={16} className="nav-work-card-chevron" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

