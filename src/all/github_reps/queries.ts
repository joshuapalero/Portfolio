import { queryOptions, useQueries } from '@tanstack/react-query';
import {
  fetchContributionsViaProxyOrDirect,
  fetchReposViaProxyOrDirect,
} from '../github_proxy';
import type { ContributionsData, GithubRepoItem } from './types';

export const githubKeys = {
  all: ['github'] as const,
  contributions: (user: string) => [...githubKeys.all, 'contributions', user] as const,
  repos: (user: string) => [...githubKeys.all, 'repos', user] as const,
};

export function githubContributionsQueryOptions(username: string) {
  return queryOptions({
    queryKey: githubKeys.contributions(username),
    queryFn: ({ signal }): Promise<ContributionsData> =>
      fetchContributionsViaProxyOrDirect<ContributionsData>(username, signal),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

export function githubReposQueryOptions(username: string, token?: string) {
  // eslint-disable-next-line @tanstack/query/exhaustive-deps -- token is an auth header, excluding from cache key
  return queryOptions({
    queryKey: githubKeys.repos(username),
    queryFn: ({ signal }): Promise<GithubRepoItem[]> =>
      fetchReposViaProxyOrDirect<GithubRepoItem[]>(username, token, signal),
    // Aurora Scharff declarative pattern: Filter metadata/portfolio content repos (Experience, About-me, Certifications-)
    // using query-level `select` transformation with structural sharing memoization.
    select: (repos: GithubRepoItem[]) =>
      repos.filter((repo) => repo.name === 'practice-activity'),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Declarative multi-query hook using TanStack Query v5 useQueries.
 */
export function useGithubData(username: string, token?: string) {
  return useQueries({
    queries: [
      githubContributionsQueryOptions(username),
      githubReposQueryOptions(username, token),
    ],
  });
}
