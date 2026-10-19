import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useChatMessages } from './queries';
import { openCommunityChat } from './moderation';
import './chat.css';

interface CommunityChatTriggerProps {
  onOpen?: () => void;
  className?: string;
  variant?: 'button' | 'badge' | 'floating' | 'link';
}

export const CommunityChatTrigger: React.FC<CommunityChatTriggerProps> = ({
  onOpen,
  className = '',
  variant = 'button',
}) => {
  const { data } = useChatMessages(false);
  const count = data?.total || data?.messages?.length || 0;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpen) {
      onOpen();
    } else {
      openCommunityChat();
    }
  };

  if (variant === 'link') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`contact-link cursor-pointer ${className}`}
        aria-label="Open community chat"
      >
        <MessageSquare size={16} />
        <span>Chat</span>
        {count > 0 && (
          <span className="text-[10px] opacity-75 font-mono">
            ({count})
          </span>
        )}
      </button>
    );
  }

  if (variant === 'floating') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={`chat-floating-trigger ${className}`}
        aria-label="Open community chat"
      >
        <span className="chat-trigger-ping-wrap">
          <span className="chat-trigger-ping" />
          <span className="chat-trigger-dot" />
        </span>
        <MessageSquare size={13} />
        <span className="chat-trigger-label">community chat</span>
        {count > 0 && (
          <span className="chat-trigger-count">
            {count}
          </span>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2 font-mono text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-1 px-2 rounded-md hover:bg-[var(--badge-bg)] cursor-pointer ${className}`}
      aria-label="Open community chat"
    >
      <MessageSquare size={14} className="shrink-0" />
      <span>community chat</span>
      {count > 0 && (
        <span className="text-[10px] opacity-75 font-mono">
          ({count})
        </span>
      )}
    </button>
  );
};

