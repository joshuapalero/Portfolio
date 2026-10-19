import { createFileRoute } from '@tanstack/react-router';
import { ProjectsHistory, ProjectsHistorySkeleton, githubProjectsQueryOptions } from '../all/project';
import { useSeoHead } from '../all/seo';

export const Route = createFileRoute('/projects')({
  loader: ({ context: { queryClient } }) => {
    const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    return queryClient.query({
      ...githubProjectsQueryOptions({ username, token }),
      staleTime: 'static',
    });
  },
  pendingComponent: () => <ProjectsHistorySkeleton />,
  component: ProjectsPage,
});

function ProjectsPage() {
  const navigate = Route.useNavigate();
  const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  useSeoHead('projects');

  return (
    <ProjectsHistory
      username={username}
      token={token ?? ''}
      onBack={() => navigate({ to: '/' })}
    />
  );
}
