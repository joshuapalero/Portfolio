import { createFileRoute } from '@tanstack/react-router';
import {
  ResourcesHistory,
  ResourcesHistorySkeleton,
  resourcesQueryOptions,
} from '../../all/resources';
import { useSeoHead } from '../../all/seo';

export const Route = createFileRoute('/resources/$slug')({
  loader: ({ context: { queryClient } }) => {
    const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    return queryClient.ensureQueryData(resourcesQueryOptions({ username, token }));
  },
  pendingComponent: () => <ResourcesHistorySkeleton />,
  component: ResourceTrackCardsPage,
});

function ResourceTrackCardsPage() {
  const { slug } = Route.useParams();
  const navigate = Route.useNavigate();
  const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  const formattedTitle =
    slug === 'fullstack'
      ? 'Full-Stack Resources'
      : slug === 'ai-engineering'
        ? 'AI Engineering Resources'
        : slug === 'backend'
          ? 'Backend & API Resources'
          : slug === 'databases'
            ? 'Database & Storage Resources'
            : slug === 'devops'
              ? 'DevOps & Cloud Resources'
              : 'Developer Resources';

  useSeoHead({
    title: `${formattedTitle} — Joshua Palero`,
    description: `Curated learning track and developer roadmaps for ${formattedTitle.toLowerCase()} compiled by Joshua Pasacay Palero.`,
    path: `/resources/${slug}`,
  });

  const handleBack = () => {
    navigate({ to: '/resources' });
  };

  return (
    <ResourcesHistory
      username={username}
      token={token ?? ''}
      trackId={slug}
      backLabel="Back to resources"
      onBack={handleBack}
    />
  );
}
