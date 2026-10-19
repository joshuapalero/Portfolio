import { queryOptions, useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { fetchFacebookPosts } from './facebook';
import type { FacebookPost } from './types';

/**
 * Query Key Factory for Facebook Posts.
 * Ensures consistent key scoping and invalidation.
 */
export const postKeys = {
  all: ['facebook-posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  detail: (slug: string) => [...postKeys.all, 'detail', slug] as const,
};

/**
 * TanStack Query v5 queryOptions pattern.
 * Decouples query configuration from UI components for clean testability and reusability.
 * Defined as a plain const (not a factory) since it takes no parameters.
 */
export const facebookPostsQueryOptions = queryOptions<readonly FacebookPost[]>({
  queryKey: postKeys.lists(),
  queryFn: fetchFacebookPosts,
  staleTime: 1000 * 60 * 15, // 15 minutes fresh cache
  gcTime: 1000 * 60 * 60,    // 1 hour in garbage collection
  retry: 2,
  refetchOnWindowFocus: false,
});

/**
 * Hook to consume live Facebook posts.
 * Provides explicit isPending, isError, and error states with ZERO mock fallbacks.
 */
export function useFacebookPosts() {
  return useQuery(facebookPostsQueryOptions);
}

/**
 * 2026 Pattern: Suspense Hook for declarative UI coordination
 */
export function useSuspenseFacebookPosts() {
  return useSuspenseQuery(facebookPostsQueryOptions);
}
