import type { ReactNode } from 'react';

export interface SocialLinkItem {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly downloadUrl?: string;
  readonly isInternal?: boolean;
  readonly icon: ReactNode;
  readonly handle?: string;
  readonly description?: string;
}

export interface RightNavigationProps {
  readonly onOpenChat?: () => void;
  readonly className?: string;
  readonly sectionId?: string;
}

export interface RightSidebarProps {
  readonly onOpenChat?: () => void;
  readonly className?: string;
  readonly sectionId?: string;
  readonly defaultCollapsed?: boolean;
}

export interface MobileRightNavProps {
  readonly onOpenChat?: () => void;
  readonly className?: string;
  readonly sectionId?: string;
}

export interface WorkTogetherProps {
  readonly title?: string;
  readonly description?: string;
  readonly buttonText?: string;
  readonly pageUrl?: string;
  readonly email?: string;
  readonly emailLabel?: string;
  readonly subject?: string;
  readonly body?: string;
  readonly allowCopy?: boolean;
  readonly callLabel?: string;
  readonly callText?: string;
  readonly callSubtext?: string;
  readonly callUrl?: string;
  readonly onActionClick?: () => void;
  readonly className?: string;
}

