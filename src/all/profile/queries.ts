import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchGithubProfile } from './fetchProfile';
import type { GithubUserProfile, FetchProfileParams } from './types';

/**
 * Aurora Scharff / TanStack Query v5 Hierarchical Query Key Factory.
 * Guarantees granular cache invalidation and declarative dependency tracking.
 */
export const profileKeys = {
  all: ['github', 'profile', 'v2'] as const,
  byUser: (username: string) => [...profileKeys.all, username] as const,
};

/**
 * Aurora Scharff queryOptions factory pattern.
 * Enables prefetching, Server-Component evaluation, and decoupled hook usage.
 */
export function profileQueryOptions(params: FetchProfileParams = {}) {
  const username = (params.username || 'joshuapalero').trim();
  const token = params.token?.trim();

  // eslint-disable-next-line @tanstack/query/exhaustive-deps -- token is an auth header, excluding from cache key
  return queryOptions<GithubUserProfile>({
    queryKey: profileKeys.byUser(username),
    queryFn: ({ signal }) => fetchGithubProfile({ username, token, signal }),
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
  });
}

/**
 * Primary React Query hook for GitHub profile data.
 */
export function useGithubProfile(params: FetchProfileParams = {}) {
  return useQuery(profileQueryOptions(params));
}

/**
 * Targeted selector hook for bio and location, adhering to Aurora Scharff's
 * fine-grained subscription pattern.
 */
export function useGithubBioAndLocation(params: FetchProfileParams = {}) {
  const query = useGithubProfile(params);
  return {
    ...query,
    bio: query.data?.bio,
    location: query.data?.location,
    name: query.data?.name,
  };
}
