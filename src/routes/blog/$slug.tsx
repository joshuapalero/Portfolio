import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import PostDetail, { PostDetailSkeleton } from '../../all/blog/post_detail';
import { facebookPostsQueryOptions, useSuspenseFacebookPosts } from '../../all/blog/queries';
import { useSeoHead } from '../../all/seo';

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ context: { queryClient }, params: { slug } }) => {
    const posts = await queryClient.query({ ...facebookPostsQueryOptions, staleTime: 'static' });
    return posts.find((p) => p.slug === slug || p.id === slug) ?? null;
  },
  pendingComponent: () => (
    <PostDetailSkeleton
      onBack={() => {
        if (typeof window !== 'undefined') window.history.back();
      }}
    />
  ),
  component: BlogPostDetailPage,
});

function BlogPostDetailPage() {
  const { slug } = Route.useParams();
  const navigate = Route.useNavigate();

  const { data: posts = [] } = useSuspenseFacebookPosts();

  const activePost = slug
    ? posts.find((p) => p.slug === slug || p.id === slug) ?? null
    : null;

  useSeoHead({
    title: activePost?.title
      ? `${activePost.title} — Joshua Palero`
      : 'Post Detail — Joshua Palero',
    description: activePost?.excerpt || 'Blog post by Joshua Pasacay Palero',
    path: `/blog/${slug}`,
    image: activePost?.imageUrl || undefined,
    type: 'article',
  });

  const handleBack = () => {
    navigate({ to: '/blog' });
  };

  if (activePost) {
    return <PostDetail post={activePost} onBack={handleBack} />;
  }

  return (
    <div className="post-not-found" role="alert">
      <AlertCircle size={28} />
      <h2>Post Not Found</h2>
      <p>This Facebook post might have been removed or the URL is invalid.</p>
      <button type="button" className="post-detail-back-btn" onClick={handleBack}>
        <ArrowLeft size={16} />
        <span>Back to all posts</span>
      </button>
    </div>
  );
}
