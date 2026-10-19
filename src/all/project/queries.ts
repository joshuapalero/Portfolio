import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchReposViaProxyOrDirect } from '../github_proxy';
import { filterProjectRepos } from './repoFilters';
import type { CardProject, RawGithubRepo } from './types';

export const projectKeys = {
  all: ['github', 'projects'] as const,
  byUser: (user: string) => [...projectKeys.all, user] as const,
};

export async function fetchRepos(
  username: string,
  token?: string,
  signal?: AbortSignal
): Promise<RawGithubRepo[]> {
  return fetchReposViaProxyOrDirect<RawGithubRepo[]>(username, token, signal);
}

export function formatRepoName(name: string): string {
  return name.replace(/[-_]/g, ' ');
}

/**
 * Transforms raw GitHub repositories into presentation card models.
 * Excludes documentation/metadata repositories (About-me, Experience, Certifications-, Resources, Technologies)
 * and archived repositories using React 19.2 & TanStack Query v5 best-practice pure transformation.
 */
export function toCards(repos: RawGithubRepo[], username: string): CardProject[] {
  return filterProjectRepos(repos, username).map((repo, i) => {
      const lang = repo.language ?? 'Code';
      const tags =
        repo.topics && repo.topics.length > 0
          ? repo.topics.slice(0, 4)
          : [lang, 'Open source'];

      const updatedAt = repo.pushed_at
        ? new Date(repo.pushed_at).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
          })
        : undefined;

      return {
        id: repo.id,
        name: formatRepoName(repo.name),
        description: repo.description?.trim() || 'Software development repository and source code.',
        language: lang,
        badge:
          i === 0
            ? '#1 Pinned repo'
            : repo.stargazers_count > 0
              ? `⭐ ${repo.stargazers_count} stars`
              : `#${i + 1} ${lang}`,
        tags,
        liveUrl: repo.homepage?.trim() || null,
        repoUrl: repo.html_url,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        updatedAt,
      };
    });
}

export interface UseGithubProjectsOptions {
  username?: string;
  token?: string;
}

/**
 * Aurora Scharff / TanStack Query v5 declarative pattern:
 * Query options encapsulate cache key, async fetcher, and cache-level `select`
 * transformation with automatic structural sharing memoization.
 */
export function githubProjectsQueryOptions({
  username = 'joshuapalero',
  token = '',
}: UseGithubProjectsOptions = {}) {
  // eslint-disable-next-line @tanstack/query/exhaustive-deps -- token is an auth header, excluding from cache key
  return queryOptions({
    queryKey: projectKeys.byUser(username),
    queryFn: ({ signal }) => fetchRepos(username, token, signal),
    enabled: Boolean(username),
    select: (repos: RawGithubRepo[]) => toCards(repos, username),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

export function useGithubProjects(options: UseGithubProjectsOptions = {}) {
  const query = useQuery(githubProjectsQueryOptions(options));

  return {
    cards: query.data ?? [],
    isPending: query.isPending,
    error: query.error,
    isError: query.isError,
    refetch: query.refetch,
    data: query.data,
  };
}

export function useSuspenseGithubProjects(options: UseGithubProjectsOptions = {}) {
  const query = useSuspenseQuery(githubProjectsQueryOptions(options));
  return {
    cards: query.data ?? [],
    data: query.data,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
