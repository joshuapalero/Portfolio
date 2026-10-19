import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  queryOptions,
  mutationOptions,
  type QueryClient,
} from '@tanstack/react-query';
import {
  loadRecommendations,
  addRecommendation,
  BROADCAST_CHANNEL,
  getSketchAvatarIndex,
} from './storage';
import {
  recommendationKeys,
  type RecommendationComment,
  type NewRecommendationPayload,
} from './types';

/**
 * Aurora Scharff / TanStack Query v5 Decoupled queryOptions Factory.
 * Can be preloaded, evaluated in Server Components/loaders, and consumed in useQuery.
 */
export function recommendationsQueryOptions() {
  return queryOptions<RecommendationComment[]>({
    queryKey: recommendationKeys.lists(),
    queryFn: ({ signal }) => loadRecommendations(signal),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60,    // 1 hour
    refetchOnWindowFocus: false,
  });
}

/**
 * Aurora Scharff / TanStack Query v5 mutationOptions Factory.
 * Encapsulates optimistic update, rollback on error, and authoritative invalidation.
 */
export function addRecommendationMutationOptions(queryClient: QueryClient) {
  return mutationOptions<
    RecommendationComment,
    Error,
    NewRecommendationPayload,
    { previousComments?: RecommendationComment[] }
  >({
    mutationKey: ['recommendations', 'add'] as const,
    mutationFn: async (payload: NewRecommendationPayload) => {
      return addRecommendation(payload);
    },
    onMutate: async (newPayload) => {
      // 1. Cancel outgoing queries to prevent overwriting optimistic cache
      await queryClient.cancelQueries({ queryKey: recommendationKeys.all });

      // 2. Snapshot previous cache for rollback
      const previousComments = queryClient.getQueryData<RecommendationComment[]>(
        recommendationKeys.lists(),
      );

      // 3. Optimistically update TanStack Query cache
      const assignedAvatarIndex =
        typeof newPayload.avatarIndex === 'number'
          ? newPayload.avatarIndex
          : getSketchAvatarIndex(newPayload.name);

      const optimisticComment: RecommendationComment = {
        id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: newPayload.name.trim(),
        role: newPayload.role?.trim() || 'Verified Endorsement',
        description: newPayload.description.trim(),
        date: new Intl.DateTimeFormat('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }).format(new Date()),
        createdAt: Date.now(),
        isOptimistic: true,
        avatarIndex: assignedAvatarIndex,
      };

      queryClient.setQueryData<RecommendationComment[]>(
        recommendationKeys.lists(),
        (old = []) => [optimisticComment, ...old],
      );

      return { previousComments };
    },
    onError: (_err, _variables, context) => {
      // Rollback to previous state if network/persistence fails
      if (context?.previousComments) {
        queryClient.setQueryData(recommendationKeys.lists(), context.previousComments);
      }
    },
    onSettled: () => {
      // Always re-sync authoritative data
      void queryClient.invalidateQueries({ queryKey: recommendationKeys.all });
    },
  });
}

/**
 * Custom hook consuming live recommendations with cross-tab BroadcastChannel sync.
 * Adheres to Aurora Scharff & TkDodo declarative data fetching architecture.
 */
export function useRecommendations() {
  const queryClient = useQueryClient();
  const query = useQuery(recommendationsQueryOptions());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Cross-tab real-time listener via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(BROADCAST_CHANNEL);
      channel.onmessage = () => {
        void queryClient.invalidateQueries({ queryKey: recommendationKeys.all });
      };
    } catch {
      // BroadcastChannel not supported, storage event fallback handles below
    }

    // Storage event fallback for cross-tab sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'portfolio_live_recommendations') {
        void queryClient.invalidateQueries({ queryKey: recommendationKeys.all });
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      if (channel) {
        channel.close();
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, [queryClient]);

  return query;
}

/**
 * Custom mutation hook for posting recommendations with TanStack Query v5 best practices.
 */
export function useAddRecommendation() {
  const queryClient = useQueryClient();
  return useMutation(addRecommendationMutationOptions(queryClient));
}

export function useSuspenseRecommendations() {
  const query = useSuspenseQuery(recommendationsQueryOptions());
  return {
    data: query.data,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
