import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import {
  fetchCertificationsFromGithub,
  type FetchCertificationParams,
} from './fetchCertifications';
import type { CertificationDataResult } from './types';

/**
 * Aurora Scharff / TanStack Query v5 Hierarchical Query Key Factory.
 * Guarantees distinct cache scoping, deterministic serialization, and granular invalidation.
 */
export const certificationKeys = {
  all: ['certifications'] as const,
  lists: () => [...certificationKeys.all, 'list'] as const,
  byUser: (username: string) => [...certificationKeys.lists(), { username }] as const,
};

/**
 * Aurora Scharff queryOptions pattern.
 * Decouples query definitions, cache timing, and fetching logic from presentation components.
 */
export function certificationQueryOptions(params: FetchCertificationParams = {}) {
  const username = params.username ?? 'joshuapalero';
  const token = params.token ?? '';

  // eslint-disable-next-line @tanstack/query/exhaustive-deps -- token is an auth header, not a cache differentiator
  return queryOptions<CertificationDataResult>({
    queryKey: certificationKeys.byUser(username),
    queryFn: ({ signal }) => fetchCertificationsFromGithub({ username, token, signal }),
    staleTime: 10 * 60 * 1000, // 10 minutes fresh
    gcTime: 60 * 60 * 1000,    // 1 hour garbage collection window
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook to consume live GitHub Certifications repository data.
 * Adheres to React 19 / TanStack Query v5 patterns with explicit pending/error states.
 */
export function useCertifications(params: FetchCertificationParams = {}) {
  return useQuery(certificationQueryOptions(params));
}

export function useSuspenseCertifications(options: FetchCertificationParams = {}) {
  const query = useSuspenseQuery(certificationQueryOptions(options));
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
