import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  fetchResourcesFromGithub,
  type FetchResourcesParams,
} from './fetchResources';
import type { ResourcesDataResult } from './types';

/**
 * Aurora Scharff / TanStack Query v5 Hierarchical Query Key Factory.
 * Guarantees distinct cache scoping, deterministic serialization, and granular invalidation.
 */
export const resourcesKeys = {
  all: ['resources'] as const,
  lists: () => [...resourcesKeys.all, 'list'] as const,
  byUser: (username: string) => [...resourcesKeys.lists(), { username }] as const,
};

export const ResourcesKeys = resourcesKeys;

/**
 * Aurora Scharff queryOptions pattern.
 * Decouples query definitions, cache timing, and fetching logic from presentation components.
 * Can be reused in loaders, prefetching, or Suspense boundaries.
 */
export function resourcesQueryOptions(params: FetchResourcesParams = {}) {
  const username = params.username ?? 'joshuapalero';
  const token = params.token ?? '';

  // eslint-disable-next-line @tanstack/query/exhaustive-deps -- token is an auth header, not a cache differentiator
  return queryOptions<ResourcesDataResult>({
    queryKey: resourcesKeys.byUser(username),
    queryFn: ({ signal }) => fetchResourcesFromGithub({ username, token, signal }),
    staleTime: 60 * 1000, // 1 minute fresh window; prompt revalidation when returning to window
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection window
    retry: 1,
    refetchOnWindowFocus: true, // Automatically re-fetches immediately when returning from editing on GitHub
    refetchOnReconnect: true,
    refetchOnMount: true,
  });
}

/**
 * Custom hook to consume live GitHub Resources repository data.
 * Adheres to React 19 / TanStack Query v5 patterns with explicit pending/error states.
 */
export function useResources(params: FetchResourcesParams = {}) {
  return useQuery(resourcesQueryOptions(params));
}

/**
 * Suspense-enabled hook for data fetching inside TanStack Router routes.
 */
export function useSuspenseResources(params: FetchResourcesParams = {}) {
  return useSuspenseQuery(resourcesQueryOptions(params));
}
