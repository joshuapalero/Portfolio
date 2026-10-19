import { useEffect } from 'react';
import ThemeToggle from '../theme/themeToggle';
import { LiveViewerInline, LikeButton } from '../live_viewers';
import { CommunityChatEmbedded, useChatMessages } from '../community_chat';
import SocialLinksList from './SocialLinksList';
import WorkTogetherSection from './WorkTogetherSection';
import SidebarResumeSection from './SidebarResumeSection';
import type { RightSidebarProps } from './types';

const STORAGE_KEY = 'portfolio_right_sidebar_collapsed';

export default function RightSidebar({
  className = '',
  sectionId = 'profile',
}: RightSidebarProps) {
  // Synchronize body class for desktop content clearance
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.add('has-sidebar-expanded');
    }
    // Clean up any stale collapsed preference so sidebar remains 100% open
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore storage error
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('has-sidebar-expanded');
      }
    };
  }, []);

  // Community chat query (always active in permanently open sidebar)
  const { data: chatData } = useChatMessages(true);
  const chatCount = chatData?.total || chatData?.messages?.length || 0;

  return (
    <aside
      className={`nav-right-sidebar is-expanded ${className}`.trim()}
      aria-label="Right sidebar quick hub"
    >
      {/* ── Permanently 100% Open Expanded Card Panel Mode (No Closing Sidebar) ── */}
      <div className="nav-sidebar-panel">
        {/* Header with Title (Closing sidebar disabled) */}
        <div className="nav-sidebar-header">
          <div className="nav-sidebar-title-group">
            <span className="nav-sidebar-title">Quick Hub</span>
          </div>
        </div>

        <div className="nav-sidebar-body">
          {/* Section 1: Theme Switcher */}
          <div className="nav-sidebar-section nav-sidebar-theme-section">
            <span className="nav-sidebar-section-label">Appearance</span>
            <ThemeToggle embedded showLabels className="nav-sidebar-theme-toggle" />
          </div>

          {/* Section 2: Real-time Presence & Likes */}
          <div className="nav-sidebar-section nav-sidebar-engagement-section">
            <span className="nav-sidebar-section-label">Presence & Likes</span>
            <div className="nav-sidebar-engagement-card">
              <div className="nav-sidebar-live-row">
                <LiveViewerInline />
              </div>
              <div className="nav-sidebar-like-row">
                <LikeButton sectionId={sectionId} className="nav-sidebar-like-btn" />
              </div>
            </div>
          </div>

          {/* Section 3: Community Chat */}
          <div className="nav-sidebar-section nav-sidebar-chat-section">
            <div className="nav-sidebar-section-header">
              <span className="nav-sidebar-section-label">Community Chat</span>
              {chatCount > 0 && <span className="nav-sidebar-count-pill">{chatCount} msg</span>}
            </div>
            <CommunityChatEmbedded active={true} />
          </div>

          {/* Section 4: Let's Work Together */}
          <div className="nav-sidebar-section nav-sidebar-work-section">
            <WorkTogetherSection />
          </div>

          {/* Section 5: Resume */}
          <SidebarResumeSection />

          {/* Section 6: Social Links */}
          <div className="nav-sidebar-section nav-sidebar-socials-section">
            <span className="nav-sidebar-section-label">Connect & Socials</span>
            <SocialLinksList variant="full" />
          </div>
        </div>
      </div>
    </aside>
  );
}

