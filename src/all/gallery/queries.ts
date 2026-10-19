import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchFacebookPhotos } from './facebook_photos';
import type { FacebookPhoto } from './types';

/**
 * Query Key Factory for Facebook Photos.
 * Scopes cache keys cleanly following TanStack Query v5 standards.
 */
export const photoKeys = {
  all: ['facebook-photos'] as const,
  lists: () => [...photoKeys.all, 'list'] as const,
};

/**
 * TanStack Query v5 queryOptions factory.
 * Decoupled query definition ensuring clean testability and reusability.
 */
export const facebookPhotosQueryOptions = () =>
  queryOptions<readonly FacebookPhoto[]>({
    queryKey: photoKeys.lists(),
    queryFn: async ({ signal }) => {
      // Allow visual inspection of the skeleton loading state for 5 seconds in browser
      if (typeof window !== 'undefined') {
        await new Promise<void>((resolve) => {
          const onAbort = () => {
            clearTimeout(timer);
            resolve();
          };
          const timer = setTimeout(() => {
            signal?.removeEventListener('abort', onAbort);
            resolve();
          }, 5000);
          signal?.addEventListener('abort', onAbort, { once: true });
        });
      }
      return fetchFacebookPhotos();
    },
    staleTime: 1000 * 60 * 15, // 15 minutes fresh cache
    gcTime: 1000 * 60 * 60,    // 1 hour garbage collection
    retry: 2,
    refetchOnWindowFocus: false,
  });

/**
 * Hook to consume live Facebook Photos independently if not supplied by parent.
 */
export function useFacebookPhotos() {
  return useQuery(facebookPhotosQueryOptions());
}
