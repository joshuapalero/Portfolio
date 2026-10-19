import { useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOrCreateSessionId,
  viewerGeoQueryOptions,
  liveViewersQueryOptions,
  viewerKeys,
  deriveFallbackLocation,
  sendLeaveSignal,
  getCachedTotalVisits,
} from './queries';
import type { LiveViewersData, ViewerLocation } from './types';

/**
 * Custom hook for real-time live portfolio viewers.
 *
 * Implements TanStack Query v5 declarative data synchronization as advocated
 * by Aurora Scharff and TkDodo:
 * - Decoupled queryOptions factory
 * - Automated declarative polling (refetchInterval)
 * - Multi-tab deduplication and cross-tab real-time sync via BroadcastChannel
 * - Instant disconnect signals on pagehide/beforeunload via navigator.sendBeacon
 * - Zero mock or hardcoded viewers ("no cap", authentic real humans)
 */
export function useLiveViewers() {
  const queryClient = useQueryClient();
  const sessionId = useMemo(() => getOrCreateSessionId(), []);

  // 1. Fetch & cache real visitor geolocation (cached with staleTime: Infinity)
  const fallbackGeo = useMemo<ViewerLocation>(() => deriveFallbackLocation(), []);
  const { data: geo = fallbackGeo } = useQuery(viewerGeoQueryOptions());

  // 2. Fetch & sync live viewers with automated background polling
  const { data, isPending, isError } = useQuery(liveViewersQueryOptions(sessionId, geo));

  // 3. Cross-tab instant synchronization, page visibility, and leave signals
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('portfolio_live_viewers_sync');
      bc.onmessage = () => {
        void queryClient.invalidateQueries({ queryKey: viewerKeys.all });
      };
    } catch {
      // BroadcastChannel fallback handled by storage event
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'portfolio_active_sessions') {
        void queryClient.invalidateQueries({ queryKey: viewerKeys.all });
      }
    };
    window.addEventListener('storage', handleStorage);

    // Refresh immediately when returning to tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void queryClient.invalidateQueries({ queryKey: viewerKeys.all });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Instant exit cleanup
    const handleLeave = () => {
      try {
        sendLeaveSignal(sessionId);
        const raw = localStorage.getItem('portfolio_active_sessions');
        if (raw) {
          const parsed = JSON.parse(raw);
          delete parsed[sessionId];
          localStorage.setItem('portfolio_active_sessions', JSON.stringify(parsed));
          bc?.postMessage({ type: 'LEAVE', id: sessionId });
        }
      } catch {
        // Ignore unload storage error
      }
    };

    window.addEventListener('pagehide', handleLeave);
    window.addEventListener('beforeunload', handleLeave);

    return () => {
      window.removeEventListener('storage', handleStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handleLeave);
      window.removeEventListener('beforeunload', handleLeave);
      bc?.close();
    };
  }, [sessionId, queryClient]);

  const liveData: LiveViewersData = data ?? {
    count: 1,
    totalVisits: getCachedTotalVisits(),
    currentViewer: geo,
    isLive: true,
  };

  return {
    count: liveData.count,
    totalVisits: liveData.totalVisits ?? getCachedTotalVisits(),
    uniqueVisitors: liveData.uniqueVisitors,
    currentViewer: liveData.currentViewer,
    isPending,
    isError,
  };
}
