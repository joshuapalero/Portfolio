import { createFileRoute } from '@tanstack/react-router';
import {
  CertificationHistory,
  CertificationHistorySkeleton,
  certificationQueryOptions,
} from '../all/certification';
import { useSeoHead } from '../all/seo';

export const Route = createFileRoute('/certifications')({
  loader: ({ context: { queryClient } }) => {
    const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    return queryClient.query({
      ...certificationQueryOptions({ username, token }),
      staleTime: 'static',
    });
  },
  pendingComponent: () => <CertificationHistorySkeleton />,
  component: CertificationsPage,
});

function CertificationsPage() {
  const navigate = Route.useNavigate();
  const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  useSeoHead('certifications');

  return (
    <CertificationHistory
      username={username}
      token={token ?? ''}
      onBack={() => navigate({ to: '/' })}
    />
  );
}
