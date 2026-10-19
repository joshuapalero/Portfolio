import { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Calendar,
  ThumbsUp,
  MessageCircle,
  Share2,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import type { FacebookPost } from './types';
import { Skeleton, SkeletonGroup, Spinner } from '../ui';
import './post_detail.css';

export interface PostDetailSkeletonProps {
  readonly onBack?: () => void;
}

/**
 * Aurora Scharff Co-located Zero-CLS Blog Post Detail Skeleton.
 * Replicates the back navigation, metadata badges, multi-line article heading,
 * 16:9 / responsive cover media, paragraph typography, and footer links.
 */
export function PostDetailSkeleton({ onBack }: PostDetailSkeletonProps) {
  return (
    <SkeletonGroup
      label="Loading Facebook blog post..."
      className="post-detail-container post-detail-skeleton-container"
    >
      {onBack && (
        <button
          type="button"
          className="post-detail-back-btn"
          onClick={onBack}
          aria-label="Back to posts"
        >
          <ArrowLeft size={16} />
          <span>Back to posts</span>
        </button>
      )}

      {/* Non-intrusive micro-loader — SkeletonGroup above owns role="status" */}
      <div className="post-detail-loading-indicator">
        <Spinner size="sm" label="Loading Facebook post" />
        <span aria-hidden="true">Loading post from Facebook...</span>
      </div>

      <header className="post-detail-header">
        <div className="post-detail-meta" aria-hidden="true">
          <Skeleton variant="rounded" width={96} height={24} />
          <Skeleton variant="rounded" width={78} height={24} />
          <Skeleton variant="rounded" width={54} height={24} />
          <Skeleton variant="rounded" width={54} height={24} />
          <Skeleton variant="rounded" width={54} height={24} />
        </div>

        <div className="post-detail-title-skeleton" aria-hidden="true">
          <Skeleton variant="text" width="90%" height={36} />
          <Skeleton variant="text" width="65%" height={36} style={{ marginTop: 8 }} />
        </div>
      </header>

      {/* Primary Attached Media Skeleton */}
      <div className="post-detail-cover-skeleton" aria-hidden="true">
        <Skeleton variant="rounded" width="100%" height={300} className="post-detail-cover-skeleton-bg" />
        <div className="post-detail-cover-skeleton-center">
          <Spinner size="md" label="Loading cover image" />
        </div>
      </div>

      <hr className="post-detail-divider" />

      {/* Body Paragraph Skeletons mirroring real article line lengths */}
      <div className="post-detail-body" aria-hidden="true">
        <div className="post-detail-skeleton-paragraph">
          <Skeleton variant="text" width="100%" height={18} />
          <Skeleton variant="text" width="98%" height={18} />
          <Skeleton variant="text" width="94%" height={18} />
          <Skeleton variant="text" width="76%" height={18} />
        </div>

        <div className="post-detail-skeleton-paragraph">
          <Skeleton variant="text" width="100%" height={17} />
          <Skeleton variant="text" width="96%" height={17} />
          <Skeleton variant="text" width="91%" height={17} />
          <Skeleton variant="text" width="64%" height={17} />
        </div>

        <div className="post-detail-skeleton-paragraph">
          <Skeleton variant="text" width="98%" height={17} />
          <Skeleton variant="text" width="88%" height={17} />
          <Skeleton variant="text" width="52%" height={17} />
        </div>
      </div>

      {/* Footer Navigation Skeletons */}
      <footer className="post-detail-footer" aria-hidden="true">
        <Skeleton variant="rounded" width={140} height={32} />
        <Skeleton variant="rounded" width={130} height={32} />
      </footer>
    </SkeletonGroup>
  );
}

/**
 * Cover Image Loader with Zero-CLS placeholder, spinner feedback,
 * and seamless opacity transition upon successful decoding.
 */
function PostDetailCoverImage({ src, alt }: { readonly src: string; readonly alt: string }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  return (
    <div className="post-detail-cover-wrapper">
      {!isLoaded && (
        <div className="post-detail-cover-img-skeleton" aria-hidden="true">
          <Skeleton variant="rounded" width="100%" height="100%" className="post-detail-cover-skeleton-bg" />
          <div className="post-detail-cover-skeleton-center">
            <Spinner size="md" label="Loading post image..." />
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`post-detail-cover-img ${isLoaded ? 'is-loaded' : 'is-loading'}`}
        loading="eager"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export interface PostDetailProps {
  readonly post?: FacebookPost | null;
  readonly isPending?: boolean;
  readonly onBack: () => void;
}

export function PostDetail({ post, isPending = false, onBack }: PostDetailProps) {
  if (isPending || !post) {
    return <PostDetailSkeleton onBack={onBack} />;
  }

  return (
    <article className="post-detail-container" aria-labelledby="post-title">
      <button
        type="button"
        className="post-detail-back-btn"
        onClick={onBack}
        aria-label="Back to posts"
      >
        <ArrowLeft size={16} />
        <span>Back to posts</span>
      </button>

      <header className="post-detail-header">
        <div className="post-detail-meta">
          <time className="post-detail-badge" dateTime={post.rawDate}>
            <Calendar size={13} />
            <span>{post.date}</span>
          </time>

          <span className="post-detail-badge">
            <Clock size={13} />
            <span>{post.readTime} read</span>
          </span>

          <span className="post-detail-badge" title="Reactions">
            <ThumbsUp size={13} />
            <span>{post.reactionsCount}</span>
          </span>

          <span className="post-detail-badge" title="Comments">
            <MessageCircle size={13} />
            <span>{post.commentsCount}</span>
          </span>

          <span className="post-detail-badge" title="Shares">
            <Share2 size={13} />
            <span>{post.sharesCount}</span>
          </span>

          {post.placeName && (
            <span className="post-detail-badge" title="Location">
              <MapPin size={13} />
              <span>{post.placeName}</span>
            </span>
          )}
        </div>

        <h1 id="post-title" className="post-detail-title">
          {post.title}
        </h1>
      </header>

      {/* Primary Attached Media with Zero-CLS Image Loader */}
      {post.imageUrl && (
        <figure className="post-detail-cover-real">
          <PostDetailCoverImage src={post.imageUrl} alt={post.title} />
        </figure>
      )}

      <hr className="post-detail-divider" />

      <div className="post-detail-body">
        {post.content.map((paragraph, idx) => (
          <p key={idx} className="post-paragraph">
            {paragraph}
          </p>
        ))}
      </div>

      <footer className="post-detail-footer">
        <button type="button" className="post-footer-back-link" onClick={onBack}>
          <ArrowLeft size={15} />
          <span>Back to all posts</span>
        </button>

        {post.permalinkUrl && (
          <a
            href={post.permalinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="post-footer-fb-link"
            aria-label="View original post on Facebook"
          >
            <ExternalLink size={14} />
            <span>View on Facebook</span>
          </a>
        )}
      </footer>
    </article>
  );
}

export default PostDetail;
