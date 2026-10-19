import { createFileRoute } from '@tanstack/react-router';
import { ExperienceHistory, ExperienceHistorySkeleton, experienceQueryOptions } from '../all/experience';
import { useSeoHead } from '../all/seo';

export const Route = createFileRoute('/experience')({
  loader: ({ context: { queryClient } }) => {
    const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    return queryClient.query({
      ...experienceQueryOptions({ username, token }),
      staleTime: 'static',
    });
  },
  pendingComponent: () => <ExperienceHistorySkeleton />,
  component: ExperiencePage,
});

function ExperiencePage() {
  const navigate = Route.useNavigate();
  const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  useSeoHead('experience');

  return (
    <ExperienceHistory
      username={username}
      token={token ?? ''}
      onBack={() => navigate({ to: '/' })}
    />
  );
}
