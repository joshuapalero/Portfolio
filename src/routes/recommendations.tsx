import { createFileRoute } from '@tanstack/react-router';
import { RecommendationsHistory, RecommendationsHistorySkeleton } from '../all/recommendations';
import { recommendationsQueryOptions } from '../all/recommendations/queries';
import { useSeoHead } from '../all/seo';

export const Route = createFileRoute('/recommendations')({
  loader: ({ context: { queryClient } }) => {
    // Non-blocking intent prefetch so route navigates immediately (0ms)
    void queryClient.query(recommendationsQueryOptions()).catch(() => {});
  },
  pendingComponent: () => <RecommendationsHistorySkeleton />,
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const navigate = Route.useNavigate();

  useSeoHead('recommendations');

  return (
    <RecommendationsHistory
      onBack={() => navigate({ to: '/' })}
    />
  );
}
