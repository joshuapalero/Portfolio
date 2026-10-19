import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  fetchPracticeActivityFromGithub,
  type FetchPracticeActivityParams,
} from './fetchPracticeActivity';
import type { PracticeActivityDataResult, PracticeActivityItem } from './types';

/**
 * Co-located Query Key Factory adhering to Tanner Linsley / TanStack v5 recommendations.
 */
export const practiceActivityKeys = {
  all: ['practice-activity'] as const,
  list: (params: FetchPracticeActivityParams = {}) =>
    [...practiceActivityKeys.all, 'list', params] as const,
  topic: (slug: string, params: FetchPracticeActivityParams = {}) =>
    [...practiceActivityKeys.all, 'topic', slug, params] as const,
};

/**
 * TanStack Query v5 queryOptions factory for prefetching in loaders and usage in components.
 */
export function practiceActivityQueryOptions(params: FetchPracticeActivityParams = {}) {
  return queryOptions<PracticeActivityDataResult>({
    queryKey: practiceActivityKeys.list(params),
    queryFn: ({ signal }) =>
      fetchPracticeActivityFromGithub({
        ...params,
        signal,
      }),
    staleTime: 1000 * 60 * 15, // 15 minutes fresh cache
    gcTime: 1000 * 60 * 60 * 2, // 2 hours garbage collection
  });
}

/**
 * Custom hook providing live or cached practice activity catalog.
 */
export function usePracticeActivity(params: FetchPracticeActivityParams = {}) {
  return useQuery(practiceActivityQueryOptions(params));
}

/**
 * Custom hook providing single topic detail by slug.
 */
export function usePracticeActivityTopic(
  slug: string,
  params: FetchPracticeActivityParams = {},
) {
  const query = usePracticeActivity(params);

  const topic: PracticeActivityItem | null =
    query.data?.items.find((item) => item.slug === slug || item.id === slug) ?? null;

  return {
    ...query,
    topic,
  };
}

/**
 * 2026 Pattern: Suspense Hooks for declarative loading UI
 */
export function useSuspensePracticeActivity(params: FetchPracticeActivityParams = {}) {
  return useSuspenseQuery(practiceActivityQueryOptions(params));
}

export function useSuspensePracticeActivityTopic(
  slug: string,
  params: FetchPracticeActivityParams = {},
) {
  const query = useSuspensePracticeActivity(params);

  const topic: PracticeActivityItem | null =
    query.data?.items.find((item) => item.slug === slug || item.id === slug) ?? null;

  return {
    ...query,
    topic,
  };
}
