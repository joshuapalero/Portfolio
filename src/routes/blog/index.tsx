import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import AllPosts, { AllPostsSkeleton } from '../../all/blog/all_posts';
import { facebookPostsQueryOptions, useSuspenseFacebookPosts } from '../../all/blog/queries';
import type { FacebookPost } from '../../all/blog/types';
import { useSeoHead } from '../../all/seo';

const blogSearchSchema = z.object({
  view: z.enum(['list', 'grid']).catch('list').optional(),
});

export const Route = createFileRoute('/blog/')({
  validateSearch: (search) => blogSearchSchema.parse(search),
  loader: ({ context: { queryClient } }) =>
    queryClient.query({ ...facebookPostsQueryOptions, staleTime: 'static' }),
  pendingComponent: () => <AllPostsSkeleton viewMode="list" />,
  component: BlogArchivePage,
});

function BlogArchivePage() {
  const navigate = Route.useNavigate();
  const { view = 'list' } = Route.useSearch();

  useSeoHead('blog');

  const {
    data: posts = [],
    isFetching,
    isError,
    error,
    refetch,
  } = useSuspenseFacebookPosts();

  const handleBack = () => {
    navigate({ to: '/' });
  };

  const handleSelectPost = (post: FacebookPost) => {
    navigate({ to: '/blog/$slug', params: { slug: post.slug || post.id } });
  };

  const handleViewModeChange = (newView: 'list' | 'grid') => {
    navigate({
      search: (prev) => ({ ...prev, view: newView }),
      replace: true,
    });
  };

  return (
    <AllPosts
      posts={posts}
      isFetching={isFetching}
      isError={isError}
      error={error}
      viewMode={view}
      onViewModeChange={handleViewModeChange}
      onRetry={refetch}
      onBack={handleBack}
      onSelectPost={handleSelectPost}
    />
  );
}
