import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchExperienceFromGist, type FetchExperienceParams } from './gist';
import type { ExperienceDataResult } from './types';

/**
 * Aurora Scharff / TanStack Query v5 Hierarchical Query Key Factory.
 * Guarantees distinct cache scoping, deterministic serializations, and granular cache invalidation.
 */
export const experienceKeys = {
  all: ['experience'] as const,
  lists: () => [...experienceKeys.all, 'list'] as const,
  byUser: (username: string, gistId?: string, token?: string) =>
    [...experienceKeys.lists(), { username, gistId: gistId ?? '', token: token ?? '' }] as const,
};

/**
 * Aurora Scharff queryOptions pattern.
 * Decouples query definitions, cache timing, and fetching logic from presentation components.
 * Can be reused in loaders, prefetching, or Suspense boundaries.
 */
export function experienceQueryOptions(params: FetchExperienceParams = {}) {
  const username = params.username ?? 'joshuapalero';
  const gistId = params.gistId ?? '';
  const token = params.token ?? '';

  // eslint-disable-next-line @tanstack/query/exhaustive-deps -- token is an auth header, not a cache differentiator; excluding to avoid leaking credentials in devtools
  return queryOptions<ExperienceDataResult>({
    queryKey: experienceKeys.byUser(username, gistId),
    queryFn: ({ signal }) => fetchExperienceFromGist({ username, gistId, token, signal }),
    staleTime: 60 * 1000, // 1 minute fresh window; balances responsive navigation with prompt revalidation
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection window
    retry: 2,
    refetchOnWindowFocus: true, // Automatically re-fetches immediately when returning from editing on GitHub!
    refetchOnReconnect: true, // Automatically re-fetches when network is restored
    refetchOnMount: true, // Re-validates when component mounts
  });
}

/**
 * Custom hook to consume live GitHub Gist experience data.
 * Adheres to React 19 / TanStack Query v5 patterns with explicit pending/error states.
 */
export function useExperience(params: FetchExperienceParams = {}) {
  return useQuery(experienceQueryOptions(params));
}

export function useSuspenseExperience(options: FetchExperienceParams = {}) {
  const query = useSuspenseQuery(experienceQueryOptions(options));
  return {
    items: query.data?.items ?? [],
    data: query.data,
    isPending: query.isPending,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
