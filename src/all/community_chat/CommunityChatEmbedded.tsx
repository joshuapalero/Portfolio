import React, { useState, useEffect, useRef, useCallback, useTransition, useOptimistic } from 'react';
import { Send, ArrowRight, Smartphone, Tablet, Monitor, X, ChevronDown } from 'lucide-react';
import type { ChatMessage } from './types';
import { useChatMessages, useSendChatMessage, useChatIdentity, useSaveChatIdentity } from './queries';
import { chatSounds } from './sound';
import {
  isOffensive,
  containsLink,
  isReservedName,
  detectDevice,
  getVisitorId,
  getAvatarUrl,
  getClientLocation,
  timeAgo,
  KINDNESS_URL,
} from './moderation';
import './chat.css';

export interface CommunityChatEmbeddedProps {
  readonly className?: string;
  readonly active?: boolean;
  readonly defaultOpen?: boolean;
}

const SEND_COOLDOWN_MS = 6000;

export const CommunityChatEmbedded: React.FC<CommunityChatEmbeddedProps> = ({
  className = '',
  active = true,
  defaultOpen,
}) => {
  const [customChatName, setCustomChatName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chatName') || '';
    }
    return '';
  });
  const [phaseOverride, setPhaseOverride] = useState<'name' | 'message' | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [promptMessage, setPromptMessage] = useState<string | null>(null);
  const [isCooldown, setIsCooldown] = useState(false);
  const [lastSentTime, setLastSentTime] = useState(0);

  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (defaultOpen !== undefined) return defaultOpen;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('portfolio_embedded_chat_open');
      if (stored !== null) return stored === 'true';
    }
    return true;
  });

  const handleCloseChat = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('portfolio_embedded_chat_open', 'false');
    } catch {
      // ignore
    }
  };

  const handleOpenEmbeddedChat = () => {
    setIsOpen(true);
    try {
      localStorage.setItem('portfolio_embedded_chat_open', 'true');
    } catch {
      // ignore
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMessagesCountRef = useRef<number>(0);
  const promptTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clientId = getVisitorId();
  const { data: identityName } = useChatIdentity(clientId);
  const { data: chatData, isLoading } = useChatMessages(active && isOpen);
  const sendMessageMutation = useSendChatMessage();
  const saveIdentityMutation = useSaveChatIdentity();

  const chatName = customChatName || identityName || '';
  const phase: 'name' | 'message' = phaseOverride ?? (chatName ? 'message' : 'name');

  const rawMessages = chatData?.messages || [];

  // React 19 useOptimistic Hook for instantaneous 0ms message insertion
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    rawMessages,
    (current: readonly ChatMessage[], newMsg: ChatMessage) => [...current, newMsg],
  );

  const [isActionPending, startTransition] = useTransition();

  const scrollToBottom = useCallback((smooth = true) => {
    const el = messagesContainerRef.current;
    if (!el) return;
    if (smooth) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  // Audio chime on new incoming message
  useEffect(() => {
    if (!isLoading && rawMessages.length > prevMessagesCountRef.current && prevMessagesCountRef.current > 0) {
      chatSounds.play('chime');
    }
    prevMessagesCountRef.current = rawMessages.length;
  }, [rawMessages.length, isLoading]);

  // Initial scroll
  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        scrollToBottom(false);
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [active, scrollToBottom]);

  // Scroll when new message arrives
  useEffect(() => {
    if (active && optimisticMessages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom(true);
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [optimisticMessages.length, active, scrollToBottom]);

  const showTempPrompt = (msg: string, duration = 2400) => {
    if (promptTimerRef.current) clearTimeout(promptTimerRef.current);
    chatSounds.play('droplet');
    setPromptMessage(msg);
    promptTimerRef.current = setTimeout(() => {
      setPromptMessage(null);
    }, duration);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;

    const adminToken = typeof window !== 'undefined' ? localStorage.getItem('portfolio_chat_admin_key') : null;

    if (val.startsWith('/admin ')) {
      const token = val.split(' ')[1];
      if (token) {
        localStorage.setItem('portfolio_chat_admin_key', token);
        showTempPrompt('Admin mode activated');
        setInputValue('');
        return;
      }
    }
    if (val === '/logout') {
      localStorage.removeItem('portfolio_chat_admin_key');
      showTempPrompt('Admin mode deactivated');
      setInputValue('');
      return;
    }

    // Phase 1: Name entry
    if (phase === 'name') {
      if (containsLink(val)) {
        showTempPrompt("name can't contain a link");
        return;
      }
      if (isReservedName(val) && !adminToken) {
        showTempPrompt('that name is reserved for the owner');
        return;
      }
      if (isOffensive(val)) {
        showTempPrompt("let's keep it kind");
        window.open(KINDNESS_URL, '_blank', 'noopener');
        setInputValue('');
        return;
      }

      setCustomChatName(val);
      setPhaseOverride('message');
      setInputValue('');
      chatSounds.play('toggle');
      saveIdentityMutation.mutate({ clientId, name: val });
      setTimeout(() => inputRef.current?.focus(), 60);
      return;
    }

    // Phase 2: Message sending with React 19 concurrent transition
    if (isOffensive(val) || isOffensive(chatName)) {
      setInputValue('');
      showTempPrompt("let's keep it kind", 2600);
      window.open(KINDNESS_URL, '_blank', 'noopener');
      return;
    }

    if (containsLink(val) || containsLink(chatName)) {
      showTempPrompt("links aren't allowed in chat");
      return;
    }

    if (isReservedName(chatName) && !adminToken) {
      showTempPrompt('that name is reserved for the owner');
      setCustomChatName('');
      setPhaseOverride('name');
      setInputValue('');
      return;
    }

    const now = Date.now();
    if (now - lastSentTime < SEND_COOLDOWN_MS) {
      showTempPrompt('easy — give it a sec…', 1600);
      return;
    }

    const device = detectDevice();
    const location = await getClientLocation();

    // React 19 Action Transition for non-blocking concurrent dispatch
    startTransition(async () => {
      const optimisticMsg: ChatMessage = {
        id: Date.now(),
        client_id: clientId,
        name: chatName,
        message: val,
        location,
        device,
        verified: !!adminToken,
        at: new Date().toISOString(),
      };

      addOptimisticMessage(optimisticMsg);
      setInputValue('');
      setLastSentTime(now);
      setIsCooldown(true);
      setTimeout(() => setIsCooldown(false), SEND_COOLDOWN_MS);

      try {
        await sendMessageMutation.mutateAsync({
          client_id: clientId,
          name: chatName,
          message: val,
          location,
          device,
          admin_key: adminToken || undefined,
        });
        setTimeout(() => inputRef.current?.focus(), 40);
      } catch (err: unknown) {
        const reason = (err as { reason?: string })?.reason;
        if (reason === 'link') {
          showTempPrompt("links aren't allowed in chat");
        } else if (reason === 'offensive') {
          showTempPrompt("let's keep it kind");
          window.open(KINDNESS_URL, '_blank', 'noopener');
        } else if (reason === 'cooldown') {
          showTempPrompt('easy — give it a sec…');
        } else if (reason === 'reserved_name') {
          showTempPrompt('that name is reserved for the owner');
        } else {
          showTempPrompt('could not send message');
          setInputValue(val);
        }
      }
    });
  };

  const renderDeviceIcon = (dev?: string) => {
    if (!dev) return null;
    if (dev === 'iPhone' || dev === 'Android') {
      return <Smartphone size={11} className="chat-dev" />;
    }
    if (dev === 'iPad' || dev === 'Android tablet') {
      return <Tablet size={11} className="chat-dev" />;
    }
    return <Monitor size={11} className="chat-dev" />;
  };

  return (
    <div className={`chat-embedded-card ${isOpen ? 'is-open' : 'is-closed'} ${className}`.trim()}>
      {/* Embedded Sub-Header with Close/Open controls */}
      <div
        className="chat-embedded-header"
        onClick={!isOpen ? handleOpenEmbeddedChat : undefined}
        style={!isOpen ? { cursor: 'pointer' } : undefined}
      >
        <div className="chat-embedded-actions">
          {isOpen ? (
            <button
              type="button"
              onClick={handleCloseChat}
              className="chat-embedded-btn chat-embedded-btn-close"
              aria-label="Close community chat"
              title="Close community chat"
            >
              <X size={13} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenEmbeddedChat}
              className="chat-embedded-btn chat-embedded-btn-open"
              aria-label="Open community chat"
              title="Open community chat"
            >
              <ChevronDown size={13} />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <>
          {/* Scrollable Messages Stream */}
          <div
            className="chat-embedded-messages"
            ref={messagesContainerRef}
            role="log"
            aria-live="polite"
            aria-label="Community chat message history"
          >
        {optimisticMessages.length === 0 ? (
          <div className="chat-empty">
            <span>no messages yet — say hi 👋</span>
          </div>
        ) : (
          optimisticMessages.map((m: ChatMessage) => (
            <div key={m.id} className="chat-item" data-message-id={m.id}>
              <img
                className="chat-avatar"
                src={getAvatarUrl(m.name, m.verified)}
                alt=""
                width={28}
                height={28}
                decoding="async"
              />
              <div className="chat-body">
                <div className="chat-author">
                  <span className={`chat-name-txt ${m.verified ? 'chat-name-verified' : ''}`}>
                    {m.name}
                  </span>
                  {m.location && (
                    <>
                      <span className="chat-sep">·</span>
                      <span className="chat-loc">{m.location}</span>
                    </>
                  )}
                  {m.device && (
                    <span className="chat-dev-wrap" title={m.device}>
                      {renderDeviceIcon(m.device)}
                    </span>
                  )}
                  {m.at && (
                    <>
                      <span className="chat-sep">·</span>
                      <span className="chat-time">{timeAgo(m.at)}</span>
                    </>
                  )}
                </div>
                <div className="chat-bubble">{m.message}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form className="chat-embedded-input-area" onSubmit={handleFormSubmit}>
        <div className="chat-embedded-prompt">
          {promptMessage ? (
            <span className="chat-prompt-alert">{promptMessage}</span>
          ) : phase === 'name' ? (
            <span>What's your name?</span>
          ) : (
            <span>
              Chatting as{' '}
              <button
                type="button"
                onClick={() => {
                  setPhaseOverride('name');
                  setInputValue(chatName);
                  setTimeout(() => inputRef.current?.focus(), 60);
                }}
                className="chat-prompt-name-btn"
                title="Click to change name"
              >
                <b>{chatName}</b>
              </button>
            </span>
          )}
        </div>
        <div className="chat-embedded-entry">
          <input
            ref={inputRef}
            className="chat-embedded-field"
            type="text"
            placeholder={phase === 'name' ? 'Enter name to join...' : 'Say something nice...'}
            maxLength={phase === 'name' ? 40 : 500}
            autoComplete="off"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            aria-label={phase === 'name' ? 'Your name' : 'Message text'}
          />
          <button
            type="submit"
            className="chat-embedded-send-btn"
            disabled={isCooldown || isActionPending || sendMessageMutation.isPending || !inputValue.trim()}
            aria-busy={isActionPending || sendMessageMutation.isPending}
            title={phase === 'name' ? 'Next' : 'Send'}
            aria-label={phase === 'name' ? 'Next' : 'Send message'}
          >
            {phase === 'name' ? <ArrowRight size={14} /> : <Send size={14} />}
          </button>
        </div>
      </form>
      </>
      )}
    </div>
  );
};

export default CommunityChatEmbedded;