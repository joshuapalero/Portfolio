import { createFileRoute } from '@tanstack/react-router';
import {
  PracticeActivityMasonry,
  PracticeActivitySkeleton,
  practiceActivityQueryOptions,
  useSuspensePracticeActivity,
} from '../../all/practice_activity';
import { useSeoHead } from '../../all/seo';

export const Route = createFileRoute('/practice-activity/')({
  loader: ({ context: { queryClient } }) => {
    const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    return queryClient.ensureQueryData(practiceActivityQueryOptions({ username, token }));
  },
  pendingComponent: () => <PracticeActivitySkeleton />,
  component: PracticeActivityArchivePage,
});

function PracticeActivityArchivePage() {
  const navigate = Route.useNavigate();
  useSeoHead('practiceActivity');

  const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  const {
    data,
    isFetching,
    isError,
    error,
    refetch,
  } = useSuspensePracticeActivity({ username, token });

  const handleBack = () => {
    navigate({ to: '/' });
  };

  return (
    <PracticeActivityMasonry
      items={data?.items}
      isFetching={isFetching}
      isError={isError}
      error={error}
      onRetry={() => refetch()}
      onBack={handleBack}
      sourceUrl={data?.sourceUrl}
      isFallback={data?.source === 'fallback-curriculum'}
      subtitle={data?.subtitle}
    />
  );
}
