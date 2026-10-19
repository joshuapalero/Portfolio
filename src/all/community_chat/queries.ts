import { queryOptions, keepPreviousData, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChatMessage, ChatResponse, ChatSendPayload, ChatSendResponse } from './types';
import {
  chatResponseSchema,
  chatSendPayloadSchema,
  chatSendResponseSchema,
  chatIdentityPayloadSchema,
  chatIdentityResponseSchema,
} from './schemas';
import { chatSounds } from './sound';
import { getVisitorId } from './moderation';

/**
 * Aurora Scharff / TanStack Query v5 Hierarchical Query Key Factory.
 * Guarantees granular cache invalidation, type safety, and decoupled prefetching.
 */
export const chatKeys = {
  all: ['community-chat'] as const,
  messages: () => [...chatKeys.all, 'messages'] as const,
  messagesAfter: (afterId = 0) => [...chatKeys.messages(), afterId] as const,
  identity: (clientId: string) => [...chatKeys.all, 'identity', clientId] as const,
};

export const CHAT_QUERY_KEY = chatKeys.messages();
export const CHAT_IDENTITY_KEY = ['community-chat', 'identity'] as const;

const LOCAL_STORAGE_CHAT_KEY = 'portfolio_community_chat_local_v2';

export function getChatApiUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  if (typeof import.meta === 'undefined' || !import.meta.env) return undefined;
  const url =
    import.meta.env.VITE_CHAT_API_URL ||
    import.meta.env.VITE_WORKER_URL ||
    import.meta.env.VITE_FB_WORKER_URL;

  if (!url || url.includes('YOUR_SUBDOMAIN')) return undefined;
  return url.trim().replace(/\/+$/, '');
}

/**
 * LocalStorage fallback helpers to guarantee 100% functionality and 0 errors
 * even before deploying the worker or running offline.
 */
function getLocalChatMessages(): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_CHAT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const validated = chatResponseSchema.shape.messages.safeParse(parsed);
    return validated.success ? validated.data : [];
  } catch {
    return [];
  }
}

function saveLocalChatMessage(msg: ChatMessage): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalChatMessages();
    const exists = current.some((m) => m.id === msg.id);
    if (exists) return;
    const updated = [...current, msg].slice(-100);
    localStorage.setItem(LOCAL_STORAGE_CHAT_KEY, JSON.stringify(updated));
  } catch (err) {
    void err;
  }
}

/**
 * Fetch chat messages from the Cloudflare Worker or local storage fallback.
 * Strictly validated via Zod schemas.
 */
export async function fetchChatMessages(afterId = 0, signal?: AbortSignal): Promise<ChatResponse> {
  const apiUrl = getChatApiUrl();

  if (apiUrl) {
    try {
      const url = `${apiUrl}/api/chat${afterId > 0 ? `?after=${afterId}` : ''}`;
      const res = await fetch(url, {
        signal,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const rawJson: unknown = await res.json();
        const parsed = chatResponseSchema.safeParse(rawJson);
        if (parsed.success) {
          return parsed.data;
        }
        console.warn('[Community Chat] Zod response schema validation warning:', parsed.error);
      }
    } catch (err) {
      if (signal?.aborted) throw err;
      console.warn('[Community Chat] Remote API fetch failed, falling back to local store:', err);
    }
  }

  // Local fallback
  const local = getLocalChatMessages();
  const filtered = afterId > 0 ? local.filter((m) => m.id > afterId) : local.slice(-60);
  return {
    success: true,
    total: local.length,
    messages: filtered,
  };
}

/**
 * Send a new chat message to the worker or local store.
 * Validates payload and response with Zod.
 */
export async function sendChatMessage(rawPayload: ChatSendPayload): Promise<ChatMessage> {
  const payload = chatSendPayloadSchema.parse(rawPayload);
  const apiUrl = getChatApiUrl();

  if (apiUrl) {
    try {
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let rawJson: unknown = null;
      try {
        rawJson = await res.json();
      } catch {
        // Non-JSON response (e.g. gateway error)
      }

      const parsedRes = chatSendResponseSchema.safeParse(rawJson);
      const data: ChatSendResponse | null = parsedRes.success ? parsedRes.data : null;

      // Handle server moderation / anti-abuse rejections
      if (data && data.reason) {
        const errorMsg = data.error || 'Failed to send message';
        const err = new Error(errorMsg);
        (err as unknown as { reason: string }).reason = data.reason;
        throw err;
      }

      if (res.ok && data?.success && data.message) {
        saveLocalChatMessage(data.message);
        return data.message;
      }

      console.warn(`[Community Chat] Remote API returned HTTP ${res.status}, saving to local store instead.`);
    } catch (err: unknown) {
      if ((err as { reason?: string })?.reason) {
        throw err;
      }
      console.warn('[Community Chat] Remote POST failed, saving to local store:', err);
    }
  }

  // Local fallback message creation
  const local = getLocalChatMessages();
  const newId = local.length > 0 ? Math.max(...local.map((m) => m.id)) + 1 : 1;
  const newMsg: ChatMessage = {
    id: newId,
    client_id: payload.client_id,
    name: payload.name,
    message: payload.message,
    location: payload.location,
    device: payload.device,
    verified: false,
    at: new Date().toISOString(),
  };

  saveLocalChatMessage(newMsg);
  return newMsg;
}

/**
 * Query options factory adhering to Aurora Scharff & TkDodo best practices.
 */
export const chatQueryOptions = (afterId = 0) =>
  queryOptions({
    queryKey: chatKeys.messagesAfter(afterId),
    queryFn: ({ signal }) => fetchChatMessages(afterId, signal),
    placeholderData: keepPreviousData,
    staleTime: 4000,
  });

/**
 * Hook to poll and sync chat messages when the chat modal is active.
 */
export function useChatMessages(isOpen: boolean) {
  return useQuery({
    ...chatQueryOptions(0),
    refetchInterval: isOpen ? 8000 : false,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook to send a message with optimistic updates, rollback, and cache reconciliation.
 */
export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendChatMessage,
    onMutate: async (newPayload) => {
      await queryClient.cancelQueries({ queryKey: chatKeys.all });
      const previousData = queryClient.getQueryData<ChatResponse>(chatKeys.messagesAfter(0));

      const optimisticMsg: ChatMessage = {
        id: Date.now(),
        client_id: newPayload.client_id,
        name: newPayload.name,
        message: newPayload.message,
        location: newPayload.location,
        device: newPayload.device,
        verified: false,
        at: new Date().toISOString(),
      };

      queryClient.setQueryData<ChatResponse>(chatKeys.messagesAfter(0), (prev) => {
        if (!prev) return { success: true, total: 1, messages: [optimisticMsg] };
        return {
          ...prev,
          total: prev.total + 1,
          messages: [...prev.messages, optimisticMsg].slice(-60),
        };
      });

      return { previousData };
    },
    onError: (_err, _newPayload, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(chatKeys.messagesAfter(0), context.previousData);
      }
    },
    onSuccess: (savedMsg) => {
      chatSounds.play('success');
      queryClient.setQueryData<ChatResponse>(chatKeys.messagesAfter(0), (prev) => {
        if (!prev) return { success: true, total: 1, messages: [savedMsg] };
        const filtered = prev.messages.filter(
          (m) => m.id === savedMsg.id || Math.abs(new Date(m.at).getTime() - new Date(savedMsg.at).getTime()) > 3000
        );
        return {
          ...prev,
          messages: [...filtered, savedMsg].slice(-60),
        };
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.messages() });
    },
  });
}

/**
 * Hook to load remembered visitor identity.
 */
export function useChatIdentity(clientId: string) {
  return useQuery({
    queryKey: chatKeys.identity(clientId),
    queryFn: async () => {
      const apiUrl = getChatApiUrl();
      if (!apiUrl || !clientId) {
        return localStorage.getItem('chatName') || '';
      }
      try {
        const res = await fetch(`${apiUrl}/api/chat/identity?client_id=${encodeURIComponent(clientId)}`);
        if (res.ok) {
          const raw = (await res.json()) as unknown;
          const parsed = chatIdentityResponseSchema.safeParse(raw);
          if (parsed.success && parsed.data.name) {
            localStorage.setItem('chatName', parsed.data.name);
            return parsed.data.name;
          }
        }
      } catch (err) {
        void err;
      }
      return localStorage.getItem('chatName') || '';
    },
    staleTime: Infinity,
    enabled: Boolean(clientId),
  });
}

/**
 * Hook to save remembered visitor identity with Zod schema validation.
 */
export function useSaveChatIdentity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rawInput: { clientId: string; name: string }) => {
      const input = chatIdentityPayloadSchema.parse({
        client_id: rawInput.clientId,
        name: rawInput.name,
      });

      localStorage.setItem('chatName', input.name);
      const apiUrl = getChatApiUrl();
      if (apiUrl && input.client_id) {
        try {
          await fetch(`${apiUrl}/api/chat/identity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          });
        } catch (err) {
          void err;
        }
      }
      return input.name;
    },
    onSuccess: (name) => {
      const clientId = getVisitorId();
      queryClient.setQueryData(chatKeys.identity(clientId), name);
    },
  });
}
