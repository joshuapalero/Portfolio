import { useState, useMemo, type MouseEvent } from 'react';
import {
  List,
  LayoutGrid,
  ArrowLeft,
  ThumbsUp,
  MessageCircle,
  Share2,
  RefreshCw,
  AlertCircle,
  FileText,
  MapPin,
} from 'lucide-react';
import type { FacebookPost } from './types';
import { isBlogStylePost } from './facebook';
import { Skeleton, SkeletonGroup, Spinner } from '../ui';
import Kinetic, { type KineticProps } from '@/components/registry/kinetic/kinetic';
import { useReducedMotion } from 'motion/react';
import './all_posts.css';

export interface AllPostsProps {
  readonly posts?: readonly FacebookPost[];
  readonly isPending?: boolean;
  readonly isFetching?: boolean;
  readonly isError?: boolean;
  readonly error?: Error | null;
  readonly onRetry?: () => void;
  readonly title?: string;
  readonly subtitle?: string;
  readonly defaultView?: 'list' | 'grid';
  readonly viewMode?: 'list' | 'grid';
  readonly onViewModeChange?: (mode: 'list' | 'grid') => void;
  readonly onBack?: () => void;
  readonly onSelectPost?: (post: FacebookPost) => void;
  readonly kineticProps?: Partial<KineticProps>;
}

/**
 * Aurora Scharff Co-located Zero-CLS Archive Skeletons for All Posts.
 * Supports both list and grid viewing modes with accessible ARIA status.
 */
export function AllPostsSkeleton({ viewMode = 'list' }: { readonly viewMode?: 'list' | 'grid' }) {
  return (
    <SkeletonGroup
      label="Loading posts archive..."
      className={viewMode === 'list' ? 'all-posts-list' : 'all-posts-grid'}
    >
      {[1, 2, 3, 4, 5, 6].map((key) => (
        <div
          key={key}
          aria-hidden="true"
          className={viewMode === 'list' ? 'all-posts-item all-posts-item-skeleton' : 'all-posts-card all-posts-card-skeleton'}
        >
          <div className="all-posts-image-skeleton">
            <Skeleton variant="rounded" width="100%" height="100%" />
          </div>
          <div className="all-posts-item-content">
            <Skeleton variant="text" width={75} height={14} />
            <Skeleton variant="text" width="80%" height={22} style={{ margin: '4px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton variant="text" width="96%" height={14} />
              <Skeleton variant="text" width="68%" height={14} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <Skeleton variant="rounded" width={52} height={18} />
              <Skeleton variant="rounded" width={42} height={18} />
              <Skeleton variant="rounded" width={42} height={18} />
            </div>
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

/**
 * Asynchronously renders a blog post's cover image with:
 * - Proper aspect ratio & container bounds matching all_posts.css (.all-posts-image-box)
 * - Skeleton placeholder with centered micro-spinner while loading
 * - referrerPolicy="no-referrer" to ensure Facebook CDN images load across origins
 * - Smooth opacity transition once image data is decoded
 * - Graceful zero-CLS fallback to the branded document icon if loading fails
 */
function PostCoverImage({ src, alt }: { readonly src: string; readonly alt: string }) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  if (hasError) {
    return (
      <div className="all-posts-fallback-box" aria-hidden="true">
        <FileText size={24} className="all-posts-brand-icon" />
      </div>
    );
  }

  return (
    <div className="all-posts-image-box" aria-hidden="true">
      {!isLoaded && (
        <div className="all-posts-image-skeleton-wrap" aria-hidden="true">
          <Skeleton variant="rounded" width="100%" height="100%" />
          <div className="all-posts-image-skeleton-spinner">
            <Spinner size="sm" label="Loading image" />
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`all-posts-image ${isLoaded ? 'is-loaded' : 'is-loading'}`}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export function AllPosts({
  posts = [],
  isPending = false,
  isFetching = false,
  isError = false,
  onRetry,
  title = 'blog',
  subtitle = 'live thoughts, updates, and notes straight from my facebook page.',
  defaultView = 'list',
  viewMode: propViewMode,
  onViewModeChange,
  onBack,
  onSelectPost,
  kineticProps,
}: AllPostsProps) {
  const prefersReducedMotion = useReducedMotion();
  const [internalViewMode, setInternalViewMode] = useState<'list' | 'grid'>(defaultView);
  const viewMode = propViewMode ?? internalViewMode;

  const handleToggleView = (mode: 'list' | 'grid') => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  // ── Filter: All-Posts page shows text-only posts AND posts with ────────────
  // substantial written content (≥ 30 words), even with an attached cover image.
  // Only short-caption photo uploads are routed to the Gallery section.
  const blogPosts = useMemo(
    () => posts.filter((post) => !post.imageUrl || isBlogStylePost(post)),
    [posts],
  );

  const handlePostClick = (e: MouseEvent<HTMLAnchorElement>, post: FacebookPost) => {
    if (onSelectPost) {
      e.preventDefault();
      onSelectPost(post);
    }
  };

  return (
    <section className="all-posts-container" aria-labelledby="all-posts-heading">
      {onBack && (
        <button
          type="button"
          className="all-posts-back-btn"
          onClick={onBack}
          aria-label={`Back to ${title}`}
        >
          <ArrowLeft size={16} />
          <span>Back to {title}</span>
        </button>
      )}

      <header className="all-posts-header">
        <div className="all-posts-title-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 id="all-posts-heading" className="all-posts-title">
              {title}
            </h1>
            {isFetching && !isPending && (
              <span className="all-posts-revalidating-wrapper" title="Synchronizing live from Facebook...">
                <Spinner size="sm" label="Syncing posts" />
              </span>
            )}
          </div>
          {subtitle && (
            <div className="all-posts-subtitle-wrapper">
              <Kinetic
                text={subtitle}
                jumpHeight={12}
                anticipation={3}
                stiffness={520}
                damping={22}
                mass={0.9}
                windUp={110}
                squash={0.5}
                stagger={28}
                interval={60000}
                trigger="loop"
                split="character"
                shadow={false}
                reducedMotion={prefersReducedMotion ?? false}
                className="all-posts-subtitle"
                {...kineticProps}
              />
            </div>
          )}
        </div>

        <div className="all-posts-view-toggle" role="group" aria-label="Toggle post view layout">
          <button
            type="button"
            className={`all-posts-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => handleToggleView('list')}
            aria-label="List view"
            title="List view"
          >
            <List size={16} className="all-posts-toggle-icon" />
          </button>
          <button
            type="button"
            className={`all-posts-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => handleToggleView('grid')}
            aria-label="Grid view"
            title="Grid view"
          >
            <LayoutGrid size={16} className="all-posts-toggle-icon" />
          </button>
        </div>
      </header>

      <hr className="all-posts-divider" />

      {/* Loading Skeletons */}
      {isPending && <AllPostsSkeleton viewMode={viewMode} />}

      {/* Error State */}
      {!isPending && isError && (
        <div className="all-posts-state-card all-posts-error-card" role="alert">
          <AlertCircle size={24} className="all-posts-state-icon" />
          <div className="all-posts-state-content">
            <h2 className="all-posts-state-title">Empty</h2>
            <p className="all-posts-state-message">
              No posts available.
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              className="all-posts-retry-btn"
              onClick={onRetry}
              aria-label="Retry loading posts"
            >
              <RefreshCw size={15} />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isPending && !isError && blogPosts.length === 0 && (
        <div className="all-posts-state-card all-posts-empty-card">
          <FileText size={28} className="all-posts-empty-icon" />
          <h2 className="all-posts-state-title">Empty</h2>
          <p className="all-posts-state-message">
            No posts available.
          </p>
        </div>
      )}

      {/* Live Feed (blog posts) */}
      {!isPending && !isError && blogPosts.length > 0 && (
        <div className={viewMode === 'list' ? 'all-posts-list' : 'all-posts-grid'}>
          {blogPosts.map((post) => (
            <article key={post.id} className="all-posts-article-card">
              <a
                href={post.permalinkUrl || `/blog/${post.slug || post.id}`}
                className={viewMode === 'list' ? 'all-posts-item' : 'all-posts-card'}
                onClick={(e) => handlePostClick(e, post)}
              >
                {post.imageUrl ? (
                  <PostCoverImage src={post.imageUrl} alt={post.title} />
                ) : (
                  <div className="all-posts-fallback-box" aria-hidden="true">
                    <FileText size={24} className="all-posts-brand-icon" />
                  </div>
                )}

                <div className="all-posts-item-content">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <time className="all-posts-item-date" dateTime={post.rawDate}>
                      {post.date}
                    </time>
                    {post.placeName && (
                      <span className="all-posts-item-date" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <MapPin size={11} />
                        <span>{post.placeName}</span>
                      </span>
                    )}
                  </div>

                  <h2 className="all-posts-item-title">{post.title}</h2>

                  {post.excerpt && <p className="all-posts-item-excerpt">{post.excerpt}</p>}

                  <footer className="all-posts-item-footer">
                    <span>Read</span>
                    <span className="all-posts-dot">·</span>
                    <span>{post.readTime}</span>

                    <span className="all-posts-dot">·</span>
                    <span className="all-posts-engagement" aria-label="Post stats">
                      <span className="all-posts-engagement-stat" title="Reactions">
                        <ThumbsUp size={12} />
                        <span>{post.reactionsCount}</span>
                      </span>
                      <span className="all-posts-engagement-stat" title="Comments">
                        <MessageCircle size={12} />
                        <span>{post.commentsCount}</span>
                      </span>
                      <span className="all-posts-engagement-stat" title="Shares">
                        <Share2 size={12} />
                        <span>{post.sharesCount}</span>
                      </span>
                    </span>
                  </footer>
                </div>
              </a>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default AllPosts;
