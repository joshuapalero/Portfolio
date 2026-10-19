import { createFileRoute } from '@tanstack/react-router';
import {
  ResourcesListArchive,
  ResourcesListArchiveSkeleton,
  resourcesQueryOptions,
  useSuspenseResources,
} from '../../all/resources';
import { useSeoHead } from '../../all/seo';

export const Route = createFileRoute('/resources/')({
  loader: ({ context: { queryClient } }) => {
    const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    return queryClient.ensureQueryData(resourcesQueryOptions({ username, token }));
  },
  pendingComponent: () => <ResourcesListArchiveSkeleton />,
  component: ResourcesListPage,
});

function ResourcesListPage() {
  const navigate = Route.useNavigate();
  const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  useSeoHead('resources');

  const { data, isFetching, isError, error, refetch } = useSuspenseResources({
    username,
    token: token ?? '',
  });

  const handleBack = () => {
    navigate({ to: '/' });
  };

  const handleSelectTrack = (trackId: string) => {
    navigate({ to: '/resources/$slug', params: { slug: trackId } });
  };

  return (
    <ResourcesListArchive
      items={data?.items ?? []}
      isPending={false}
      isFetching={isFetching}
      isError={isError}
      error={error}
      lastUpdated={data?.lastUpdated}
      onRetry={() => void refetch()}
      onBack={handleBack}
      onSelectTrack={handleSelectTrack}
    />
  );
}
