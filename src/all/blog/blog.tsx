import { useMemo, type MouseEvent } from 'react';
import { ArrowRight, ThumbsUp, MessageCircle, Share2, RefreshCw, AlertCircle, MapPin } from 'lucide-react';
import type { FacebookPost } from './types';
import { isBlogStylePost } from './facebook';
import { Skeleton, SkeletonGroup, Spinner } from '../ui';
import './blog.css';

export interface BlogProps {
  readonly posts?: readonly FacebookPost[];
  readonly isPending?: boolean;
  readonly isFetching?: boolean;
  readonly isError?: boolean;
  readonly error?: Error | null;
  readonly onRetry?: () => void;
  readonly sectionNumber?: string;
  readonly sectionTitle?: string;
  readonly allPostsUrl?: string;
  readonly onViewAllPosts?: () => void;
  readonly onSelectPost?: (post: FacebookPost) => void;
}

/**
 * Aurora Scharff Co-located Zero-CLS Blog Post List Skeleton.
 * Replicates the post item header, title, date badge, excerpt lines,
 * and engagement metrics.
 */
export function BlogSkeleton() {
  return (
    <SkeletonGroup
      label="Loading latest Facebook posts..."
      className="blog-skeleton-group"
    >
      {[1, 2, 3].map((key) => (
        <div key={key} className="blog-item blog-item--skeleton" aria-hidden="true">
          <div className="blog-item-header">
            <Skeleton variant="text" width="60%" height={22} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Skeleton variant="text" width={70} height={16} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '6px 0' }}>
            <Skeleton variant="text" width="92%" height={15} />
            <Skeleton variant="text" width="65%" height={15} />
          </div>
          <div className="blog-item-engagement" style={{ marginTop: 6, gap: 14 }}>
            <Skeleton variant="rounded" width={44} height={20} />
            <Skeleton variant="rounded" width={44} height={20} />
            <Skeleton variant="rounded" width={44} height={20} />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

export function Blog({
  posts = [],
  isPending = false,
  isFetching = false,
  isError = false,
  onRetry,
  sectionNumber = '01',
  sectionTitle = 'Blog',
  allPostsUrl = '/blog',
  onViewAllPosts,
  onSelectPost,
}: BlogProps) {
  // ── Filter: Blog shows text-only posts AND posts with substantial written ──
  // content (≥ 30 words), even if they have an attached cover image.
  // Only short-caption photo uploads are routed to the Gallery section.
  const blogPosts = useMemo(
    () => posts.filter((post) => !post.imageUrl || isBlogStylePost(post)),
    [posts],
  );

  const handleAllPostsClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onViewAllPosts) {
      e.preventDefault();
      onViewAllPosts();
    }
  };

  const handlePostClick = (e: MouseEvent<HTMLAnchorElement>, post: FacebookPost) => {
    if (onSelectPost) {
      e.preventDefault();
      onSelectPost(post);
    }
  };

  return (
    <section className="blog-section" aria-label="Facebook Blog Posts">
      <header className="blog-header">
        <div className="blog-title-label">
          <span>{sectionNumber} —</span>
          <span className="blog-word">{sectionTitle}</span>
          {isFetching && !isPending && (
            <span className="blog-revalidating-wrapper" title="Synchronizing live from Facebook...">
              <Spinner size="sm" label="Syncing blog posts" className="blog-revalidating-spinner" />
            </span>
          )}
        </div>

        <a
          href={allPostsUrl}
          className="blog-all-posts-link"
          onClick={handleAllPostsClick}
        >
          <span>see post</span>
          <ArrowRight size={15} />
        </a>
      </header>

      <hr className="blog-divider" />

      <div className="blog-list">
        {/* Loading State: Accessible Semantic Skeletons */}
        {isPending && <BlogSkeleton />}

        {/* Error State: Humanized error UI with interactive retry */}
        {!isPending && isError && (
          <div className="blog-state-card blog-error-card" role="alert">
            <AlertCircle size={20} className="blog-state-icon" />
            <div className="blog-state-content">
              <p className="blog-state-title">Empty</p>
              <p className="blog-state-message">
                No posts available.
              </p>
            </div>
            {onRetry && (
              <button
                type="button"
                className="blog-retry-button"
                onClick={onRetry}
                aria-label="Retry loading posts"
              >
                <RefreshCw size={14} />
                <span>Try Again</span>
              </button>
            )}
          </div>
        )}

        {/* Empty State: Zero text-only posts on Facebook Page */}
        {!isPending && !isError && blogPosts.length === 0 && (
          <div className="blog-state-card blog-empty-card">
            <p className="blog-state-title">Empty</p>
            <p className="blog-state-message">
              No posts available.
            </p>
          </div>
        )}

        {/* Success State: 100% Live Facebook Feed (blog posts) */}
        {!isPending &&
          !isError &&
          blogPosts.map((post) => (
            <article key={post.id} className="blog-article-wrapper">
              <a
                href={post.permalinkUrl || `/blog/${post.slug || post.id}`}
                className="blog-item"
                onClick={(e) => handlePostClick(e, post)}
              >
                <div className="blog-item-header">
                  <h3 className="blog-item-title">{post.title}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <time className="blog-item-date" dateTime={post.rawDate}>
                      {post.date}
                    </time>
                    {post.placeName && (
                      <span className="blog-item-date" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={11} />
                        <span>{post.placeName}</span>
                      </span>
                    )}
                  </div>
                </div>

                {post.excerpt && <p className="blog-item-excerpt">{post.excerpt}</p>}

                <footer className="blog-item-engagement" aria-label="Engagement metrics">
                  <span className="blog-engagement-stat" title="Reactions">
                    <ThumbsUp size={13} />
                    <span>{post.reactionsCount}</span>
                  </span>
                  <span className="blog-engagement-stat" title="Comments">
                    <MessageCircle size={13} />
                    <span>{post.commentsCount}</span>
                  </span>
                  <span className="blog-engagement-stat" title="Shares">
                    <Share2 size={13} />
                    <span>{post.sharesCount}</span>
                  </span>
                </footer>
              </a>
            </article>
          ))}
      </div>
    </section>
  );
}

export default Blog;
