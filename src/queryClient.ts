import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min — data is fresh
      gcTime: 30 * 60 * 1000,     // 30 min — 6× staleTime, safe retention in memory
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
