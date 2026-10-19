import { useState, useEffect, useCallback } from 'react';
import {
  Menu,
  X,
} from 'lucide-react';
import ThemeToggle from '../theme/themeToggle';
import { LiveViewerInline, LikeButton, useLiveViewers } from '../live_viewers';
import { CommunityChatEmbedded, useChatMessages } from '../community_chat';
import SocialLinksList from './SocialLinksList';
import WorkTogetherSection from './WorkTogetherSection';
import SidebarResumeSection from './SidebarResumeSection';
import type { MobileRightNavProps } from './types';

export default function MobileRightNav({
  className = '',
  sectionId = 'profile',
}: MobileRightNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Live presence query
  const { count: viewerCount } = useLiveViewers();

  // Community chat query
  const { data: chatData } = useChatMessages(isOpen);
  const chatCount = chatData?.total || chatData?.messages?.length || 0;

  const handleOpen = () => setIsOpen(true);
  const handleClose = useCallback(() => setIsOpen(false), []);

  // Lock body scroll and sync body class when mobile drawer is open
  useEffect(() => {
    if (typeof document === 'undefined') return;

    document.body.classList.toggle('has-mobile-nav-open', isOpen);

    if (!isOpen) {
      return () => {
        document.body.classList.remove('has-mobile-nav-open');
      };
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.classList.remove('has-mobile-nav-open');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      {/* ── Floating Mobile Trigger (Docked on Right Section) ── */}
      <button
        type="button"
        className={`nav-mobile-trigger ${className}`.trim()}
        onClick={handleOpen}
        aria-label={`Open navigation hub (${Math.max(1, viewerCount)} active)`}
        aria-expanded={isOpen}
      >
        <span className="nav-mobile-trigger-ping-wrap">
          <span className="nav-mobile-trigger-ping" />
          <span className="nav-mobile-trigger-dot" />
        </span>
        <Menu size={16} className="nav-mobile-trigger-icon" aria-hidden="true" />
        <span className="nav-mobile-trigger-label">Connect</span>
      </button>

      {/* ── Slide-Over Backdrop ── */}
      <div
        className={`nav-mobile-backdrop ${isOpen ? 'is-visible' : ''}`}
        onClick={handleClose}
        aria-hidden={!isOpen}
      />

      {/* ── Slide-Over Right Drawer ── */}
      <div
        className={`nav-mobile-drawer ${isOpen ? 'is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation and hub"
      >
        {/* Drawer Header */}
        <div className="nav-mobile-drawer-header">
          <div className="nav-mobile-drawer-title-group">
            <span className="nav-mobile-drawer-title">Navigation & Hub</span>
          </div>
          <button
            type="button"
            className="nav-mobile-drawer-close-btn"
            onClick={handleClose}
            aria-label="Close navigation drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="nav-mobile-drawer-content">
          {/* Section 1: Appearance / Theme */}
          <div className="nav-mobile-section nav-mobile-theme-section">
            <span className="nav-mobile-section-label">Appearance</span>
            <div className="nav-mobile-theme-wrapper">
              <ThemeToggle embedded showLabels className="nav-mobile-theme-toggle" />
            </div>
          </div>

          {/* Section 2: Real-time Presence & Likes */}
          <div className="nav-mobile-section nav-mobile-engagement-section">
            <span className="nav-mobile-section-label">Presence & Likes</span>
            <div className="nav-mobile-engagement-card">
              <div className="nav-mobile-viewers-row">
                <LiveViewerInline />
              </div>
              <div className="nav-mobile-like-row">
                <LikeButton sectionId={sectionId} className="nav-mobile-like-btn" />
              </div>
            </div>
          </div>

          {/* Section 3: Community Chat */}
          <div className="nav-mobile-section nav-mobile-chat-section">
            <div className="nav-mobile-section-header">
              <span className="nav-mobile-section-label">Community Chat</span>
              {chatCount > 0 && <span className="nav-mobile-count-pill">{chatCount} msg</span>}
            </div>
            <CommunityChatEmbedded active={isOpen} />
          </div>

          {/* Section 4: Let's Work Together */}
          <div className="nav-mobile-section nav-mobile-work-section">
            <WorkTogetherSection onActionClick={handleClose} />
          </div>

          {/* Section 5: Resume */}
          <SidebarResumeSection onActionClick={handleClose} />

          {/* Section 6: Social Links */}
          <div className="nav-mobile-section nav-mobile-socials-section">
            <span className="nav-mobile-section-label">Connect & Socials</span>
            <SocialLinksList variant="full" onItemClick={handleClose} />
          </div>
        </div>
      </div>
    </>
  );
}
