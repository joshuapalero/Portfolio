import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import {
  PracticeDetail,
  PracticeActivitySkeleton,
  practiceActivityQueryOptions,
  useSuspensePracticeActivityTopic,
} from '../../all/practice_activity';
import { useSeoHead } from '../../all/seo';

export const Route = createFileRoute('/practice-activity/$slug')({
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
    const token = import.meta.env.VITE_GITHUB_TOKEN;
    const res = await queryClient.ensureQueryData(
      practiceActivityQueryOptions({ username, token }),
    );
    return res.items.find((item) => item.slug === slug || item.id === slug) ?? null;
  },
  pendingComponent: () => <PracticeActivitySkeleton columnCount={1} />,
  component: PracticeActivityTopicPage,
});

function PracticeActivityTopicPage() {
  const { slug } = Route.useParams();
  const navigate = Route.useNavigate();

  const username = import.meta.env.VITE_GITHUB_USERNAME || 'joshuapalero';
  const token = import.meta.env.VITE_GITHUB_TOKEN;

  const { topic, data } = useSuspensePracticeActivityTopic(slug, {
    username,
    token,
  });

  useSeoHead({
    title: topic?.title
      ? `${topic.title} — Joshua Palero`
      : 'Practice Activity — Joshua Palero',
    description: topic?.summary || topic?.excerpt || 'Interactive developer activity and Git practice guide.',
    path: `/practice-activity/${slug}`,
  });

  const handleBack = () => {
    navigate({ to: '/practice-activity' });
  };

  if (topic) {
    return (
      <PracticeDetail
        item={topic}
        onBack={handleBack}
        sourceUrl={data?.sourceUrl}
      />
    );
  }

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '4rem 1rem',
        maxWidth: 600,
        margin: '0 auto',
      }}
      role="alert"
    >
      <AlertCircle size={36} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
      <h2 style={{ fontSize: '1.5rem', marginBottom: 8, color: 'var(--text-primary)' }}>Practice Guide Not Found</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
        The practice activity guide &ldquo;{slug}&rdquo; could not be found or has moved.
      </p>
      <button
        type="button"
        className="practice-back-btn"
        onClick={handleBack}
        style={{ margin: '0 auto' }}
      >
        <ArrowLeft size={16} />
        <span>Back to all practice activities</span>
      </button>
    </div>
  );
}
