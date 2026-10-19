import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchBioFromGithub } from './fetchBio';
import type { BioItem, FetchBioParams } from './types';

export const bioKeys = {
  all: ['bio', 'v2'] as const,
  byUserAndRepo: (username: string, repo: string) =>
    [...bioKeys.all, username, repo] as const,
};

export function bioQueryOptions(params: FetchBioParams = {}) {
  const username = params.username ?? 'joshuapalero';
  const repo = params.repo ?? 'About-me';
  const token = params.token ?? '';

  // eslint-disable-next-line @tanstack/query/exhaustive-deps -- token is an auth header, excluding from cache key
  return queryOptions<BioItem>({
    queryKey: bioKeys.byUserAndRepo(username, repo),
    queryFn: ({ signal }) => fetchBioFromGithub({ username, repo, token, signal }),
    staleTime: 10 * 60 * 1000, // 10 minutes fresh cache
    gcTime: 60 * 60 * 1000,    // 1 hour garbage collection
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useBio(params: FetchBioParams = {}) {
  return useQuery(bioQueryOptions(params));
}
