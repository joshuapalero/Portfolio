import RightSidebar from './RightSidebar';
import MobileRightNav from './MobileRightNav';
import type { RightNavigationProps } from './types';
import './navigation.css';

/**
 * RightNavigation
 *
 * Senior-level responsive hub providing:
 * 1. Desktop Right Sidebar (dock rail + expanded card panel with theme, liveviewers, likes, chat, socials)
 * 2. Mobile Right Navigation (floating trigger + slide-over drawer with theme, liveviewers, likes, chat, socials)
 */
export default function RightNavigation({
  onOpenChat,
  className = '',
  sectionId = 'profile',
}: RightNavigationProps) {
  return (
    <div className={`navigation-hub-root ${className}`.trim()}>
      <RightSidebar onOpenChat={onOpenChat} sectionId={sectionId} />
      <MobileRightNav onOpenChat={onOpenChat} sectionId={sectionId} />
    </div>
  );
}

export { RightSidebar, MobileRightNav };
