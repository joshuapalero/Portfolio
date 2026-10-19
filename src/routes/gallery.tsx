import { createFileRoute } from '@tanstack/react-router';
import { GalleryHistory } from '../all/gallery';
import { facebookPostsQueryOptions, useSuspenseFacebookPosts } from '../all/blog/queries';
import { useSeoHead } from '../all/seo';

export const Route = createFileRoute('/gallery')({
  loader: ({ context: { queryClient } }) =>
    queryClient.query({ ...facebookPostsQueryOptions, staleTime: 'static' }),
  component: GalleryPage,
});

function GalleryPage() {
  const navigate = Route.useNavigate();
  const {
    data: posts = [],
    isError,
    error,
    refetch,
  } = useSuspenseFacebookPosts();

  useSeoHead('gallery');

  return (
    <GalleryHistory
      posts={posts}
      isError={isError}
      error={error}
      onRetry={refetch}
      onBack={() => navigate({ to: '/' })}
    />
  );
}
