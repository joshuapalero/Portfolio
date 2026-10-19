import React from 'react';

export interface CommunityChatOverlayProps {
  readonly isOpen?: boolean;
  readonly onClose?: () => void;
}

/**
 * @deprecated Community chat is permanently embedded exclusively inside the right sidebar.
 * This overlay component returns null and is completely disabled.
 */
export const CommunityChatOverlay: React.FC<CommunityChatOverlayProps> = () => {
  return null;
};

export default CommunityChatOverlay;
