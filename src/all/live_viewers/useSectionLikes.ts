import { useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrCreateDeviceId } from './queries';

const STORAGE_KEY_PREFIX = 'portfolio_likes_';
const CHANNEL_NAME = 'portfolio_likes_sync';

interface LikesState {
  count: number;
  userLiked: boolean;
}

function getLocalKey(sectionId: string): string {
  return `${STORAGE_KEY_PREFIX}${sectionId}`;
}

function loadLocalLikes(sectionId: string): LikesState {
  if (typeof window === 'undefined') return { count: 0, userLiked: false };
  try {
    const raw = localStorage.getItem(getLocalKey(sectionId));
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        count: Math.max(0, Number(parsed.count) || 0),
        userLiked: Boolean(parsed.userLiked),
      };
    }
  } catch {
    // fallback
  }
  return { count: 0, userLiked: false };
}

function saveLocalLikes(sectionId: string, state: LikesState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getLocalKey(sectionId), JSON.stringify(state));
  } catch {
    // ignore
  }
}

async function fetchRemoteLikes(sectionId: string, visitorId: string): Promise<LikesState> {
  const local = loadLocalLikes(sectionId);
  const workerUrl = import.meta.env.VITE_FB_WORKER_URL;
  if (!workerUrl || workerUrl.includes('YOUR_SUBDOMAIN')) {
    return local;
  }

  try {
    const base = workerUrl.replace(/\/+$/, '');
    const url = `${base}/api/reactions?section=${encodeURIComponent(sectionId)}&visitorId=${encodeURIComponent(visitorId)}`;
    const res = await fetch(url, { method: 'GET', credentials: 'omit' });
    if (res.ok) {
      const data = (await res.json()) as { success?: boolean; count?: number; userLiked?: boolean };
      if (data.success && typeof data.count === 'number') {
        const state: LikesState = {
          count: data.count,
          userLiked: Boolean(data.userLiked),
        };
        saveLocalLikes(sectionId, state);
        return state;
      }
    }
  } catch {
    // fallback to local state
  }

  return local;
}

async function sendRemoteLike(
  sectionId: string,
  visitorId: string,
  action: 'like' | 'unlike',
): Promise<LikesState | null> {
  const workerUrl = import.meta.env.VITE_FB_WORKER_URL;
  if (!workerUrl || workerUrl.includes('YOUR_SUBDOMAIN')) return null;

  try {
    const base = workerUrl.replace(/\/+$/, '');
    const res = await fetch(`${base}/api/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section: sectionId, visitorId, action }),
    });
    if (res.ok) {
      const data = (await res.json()) as { success?: boolean; count?: number; userLiked?: boolean };
      if (data.success && typeof data.count === 'number') {
        return {
          count: data.count,
          userLiked: Boolean(data.userLiked),
        };
      }
    }
  } catch {
    // ignore network error
  }
  return null;
}

/**
 * Aurora Scharff / TanStack Query v5 Hierarchical Query Key Factory for Reactions.
 */
export const reactionKeys = {
  all: ['reactions'] as const,
  bySection: (sectionId: string) => [...reactionKeys.all, sectionId] as const,
  byVisitor: (sectionId: string, visitorId: string) =>
    [...reactionKeys.bySection(sectionId), visitorId] as const,
};

export function useSectionLikes(sectionId = 'profile') {
  const queryClient = useQueryClient();
  const visitorId = useMemo(() => getOrCreateDeviceId(), []);

  const queryKey = useMemo(
    () => reactionKeys.byVisitor(sectionId, visitorId),
    [sectionId, visitorId],
  );

  // TanStack Query v5 cache as the single source of truth
  const { data = loadLocalLikes(sectionId) } = useQuery({
    queryKey,
    queryFn: () => fetchRemoteLikes(sectionId, visitorId),
    initialData: () => loadLocalLikes(sectionId),
    staleTime: 10_000,
  });

  // Cross-tab synchronization via BroadcastChannel and StorageEvent
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (e) => {
        if (e.data?.sectionId === sectionId && e.data?.state) {
          queryClient.setQueryData(queryKey, e.data.state);
        }
      };
    } catch {
      // BroadcastChannel unavailable
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === getLocalKey(sectionId)) {
        const fresh = loadLocalLikes(sectionId);
        queryClient.setQueryData(queryKey, fresh);
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      bc?.close();
    };
  }, [sectionId, queryKey, queryClient]);

  // Mutation with destructured referentially stable mutate function
  const { mutate, isPending } = useMutation({
    mutationFn: (action: 'like' | 'unlike') => sendRemoteLike(sectionId, visitorId, action),
    onSuccess: (result) => {
      if (result) {
        saveLocalLikes(sectionId, result);
        queryClient.setQueryData(queryKey, result);
      }
    },
  });

  const toggleLike = useCallback(() => {
    const current = queryClient.getQueryData<LikesState>(queryKey) ?? loadLocalLikes(sectionId);
    const nextLiked = !current.userLiked;
    const nextCount = nextLiked ? current.count + 1 : Math.max(0, current.count - 1);
    const nextState: LikesState = { count: nextCount, userLiked: nextLiked };

    saveLocalLikes(sectionId, nextState);
    queryClient.setQueryData(queryKey, nextState);

    // Broadcast to other tabs
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ sectionId, state: nextState });
      bc.close();
    } catch {
      // ignore
    }

    // Trigger mutation
    mutate(nextLiked ? 'like' : 'unlike');
  }, [sectionId, queryKey, queryClient, mutate]);

  return {
    count: data.count,
    userLiked: data.userLiked,
    toggleLike,
    isPending,
  };
}
