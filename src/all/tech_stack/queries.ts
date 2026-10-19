import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchTechStackFromGithub } from './fetchTechStack';
import type { FetchTechStackParams, TechStackDataResult } from './types';

/**
 * Aurora Scharff / TanStack Query v5 Hierarchical Query Key Factory for Technologies.
 */
export const techStackKeys = {
  all: ['tech-stack'] as const,
  lists: () => [...techStackKeys.all, 'list'] as const,
  byUser: (username: string) => [...techStackKeys.lists(), { username }] as const,
};

/**
 * TanStack Query options for dynamic TechStack loading from GitHub.
 */
export function techStackQueryOptions(params: FetchTechStackParams = {}) {
  const username = (
    params.username ||
    (typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_GITHUB_USERNAME as string | undefined)
      : undefined) ||
    'joshuapalero'
  ).trim();

  const token = params.token ?? '';

  // eslint-disable-next-line @tanstack/query/exhaustive-deps -- token is an auth header, not a cache differentiator
  return queryOptions<TechStackDataResult>({
    queryKey: techStackKeys.byUser(username),
    queryFn: ({ signal }) => fetchTechStackFromGithub({ username, token, signal }),
    staleTime: 60 * 1000, // 1 minute fresh window
    gcTime: 60 * 60 * 1000, // 1 hour garbage collection window
    retry: 2,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchOnMount: true,
  });
}

/**
 * Custom hook to consume dynamic GitHub Technologies stack data.
 */
export function useTechStack(params: FetchTechStackParams = {}) {
  return useQuery(techStackQueryOptions(params));
}

export function useSuspenseTechStack(options: FetchTechStackParams = {}) {
  const query = useSuspenseQuery(techStackQueryOptions(options));
  return {
    items: query.data?.items ?? [],
    groups: query.data?.groups ?? [],
    rows: query.data?.rows ?? [],
    data: query.data,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
