import React, { useMemo, useState, type MouseEvent } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import type { ResourceItem } from './types';
import { Skeleton, SkeletonGroup, Spinner } from '../ui';
import { LikeButton } from '../live_viewers';
import { buildResourceTracks, type ResourceTrackSummary } from './track_helpers';
import { getAutoImage } from '../../lib/getAutoImage';
import Kinetic from '@/components/registry/kinetic/kinetic';
import './resources.css';

/**
 * Resilient thumbnail for a resource track.
 * Renders the Unsplash editorial photo; on load error, falls back to the
 * 2×2 icon grid built from the track's first four resource icons.
 */
function ResourcesArchiveThumb({
  src,
  alt,
  acronym,
  previewIcons,
}: {
  src: string;
  alt: string;
  acronym: string;
  previewIcons: readonly React.ReactNode[];
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="resources-archive-thumb-box" aria-hidden="true">
      {!imgError ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <>
          <div className="resources-thumb-pattern" />
          {previewIcons.length > 0 && (
            <div className="resources-thumb-icon-grid">
              {previewIcons.slice(0, 4).map((icon, i) => (
                // biome-ignore lint/suspicious/noArrayIndexKey: stable positional grid
                <div key={i} className="resources-thumb-grid-cell">
                  {icon}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <div className="resources-thumb-badge">{acronym}</div>
    </div>
  );
}

export interface ResourcesListArchiveProps {
  readonly items?: readonly ResourceItem[];
  readonly isPending?: boolean;
  readonly isFetching?: boolean;
  readonly isError?: boolean;
  readonly error?: Error | null;
  readonly lastUpdated?: string;
  readonly onRetry?: () => void;
  readonly onBack?: () => void;
  readonly onSelectTrack?: (trackId: string) => void;
}

/**
 * Aurora Scharff Co-located Zero-CLS Skeletons for Second Page Resources List Archive.
 */
export function ResourcesListArchiveSkeleton() {
  return (
    <SkeletonGroup
      label="Loading developer resources..."
      className="resources-list-archive-list"
    >
      {[1, 2, 3, 4].map((key) => (
        <div
          key={key}
          aria-hidden="true"
          className="resources-archive-item resources-archive-item--skeleton"
        >
          <div className="resources-archive-thumb-skeleton">
            <Skeleton variant="rounded" width="100%" height="100%" />
          </div>
          <div className="resources-archive-content">
            <div className="resources-archive-header-row">
              <Skeleton variant="text" width={120} height={14} />
              <Skeleton variant="text" width={60} height={14} />
            </div>
            <Skeleton variant="text" width="75%" height={22} style={{ margin: '4px 0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Skeleton variant="text" width="96%" height={14} />
              <Skeleton variant="text" width={70} height={14} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <Skeleton variant="rounded" width={64} height={18} />
              <Skeleton variant="rounded" width={80} height={18} />
              <Skeleton variant="rounded" width={110} height={18} />
            </div>
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

export function ResourcesListArchive({
  items = [],
  isPending = false,
  isFetching = false,
  isError = false,
  lastUpdated,
  onRetry,
  onBack,
  onSelectTrack,
}: ResourcesListArchiveProps) {
  // ── Dynamically construct high-signal Resource Tracks from live data ──
  const tracks = useMemo<ResourceTrackSummary[]>(() => buildResourceTracks(items, lastUpdated), [items, lastUpdated]);

  const handleTrackClick = (e: MouseEvent<HTMLAnchorElement>, trackId: string) => {
    if (onSelectTrack) {
      e.preventDefault();
      onSelectTrack(trackId);
    }
  };

  return (
    <section className="resources-archive-container" aria-labelledby="resources-archive-heading">
      {/* Top Navigation Bar: Back to Home + Reactions Like Button */}
      <div className="resources-archive-top-bar">
        {onBack && (
          <button
            type="button"
            className="resources-archive-back-btn"
            onClick={onBack}
            aria-label="Back to home"
          >
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </button>
        )}

        <LikeButton sectionId="resources" className="resources-page-like-btn" />
      </div>

      {/* Header: Pure List View Directory */}
      <header className="resources-archive-header">
        <div className="resources-archive-title-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 id="resources-archive-heading" className="resources-archive-title">
              developer resources
            </h1>
            {isFetching && !isPending && (
              <span className="resources-revalidating-wrapper" title="Synchronizing live from GitHub...">
                <Spinner size="sm" label="Syncing resources" />
              </span>
            )}
          </div>
          <div className="resources-archive-subtitle">
            <Kinetic
              text="professional software engineering resources."
              jumpHeight={12}
              anticipation={3}
              stiffness={520}
              damping={22}
              mass={0.9}
              windUp={110}
              squash={0.5}
              stagger={28}
              interval={60000}
              shadow={false}
            />
          </div>
        </div>
      </header>

      <hr className="resources-archive-divider" />

      {/* Loading Skeletons */}
      {isPending && <ResourcesListArchiveSkeleton />}

      {/* Error State */}
      {!isPending && isError && (
        <div className="resources-archive-state-card resources-archive-error-card" role="alert">
          <AlertCircle size={24} className="resources-archive-state-icon" />
          <div className="resources-archive-state-content">
            <h2 className="resources-archive-state-title">Unable to load resources</h2>
            <p className="resources-archive-state-message">
              We encountered an error synchronizing resources from your GitHub repository.
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              className="resources-archive-retry-btn"
              onClick={onRetry}
              aria-label="Retry loading resources"
            >
              <RefreshCw size={15} />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isPending && !isError && tracks.length === 0 && (
        <div className="resources-archive-state-card resources-archive-empty-card">
          <BookOpen size={28} className="resources-archive-empty-icon" />
          <h2 className="resources-archive-state-title">No resources available</h2>
          <p className="resources-archive-state-message">
            Resources added to your GitHub repository will appear here automatically.
          </p>
        </div>
      )}

      {/* ── SECOND PAGE: PURE LIST VIEW ONLY ── */}
      {!isPending && !isError && tracks.length > 0 && (
        <div className="resources-list-archive-list" role="list">
          {tracks.map((track) => (
            <article key={track.id} className="resources-archive-article-card" role="listitem">
              <a
                href={`/resources/${track.id}`}
                className="resources-archive-item"
                onClick={(e) => handleTrackClick(e, track.id)}
                aria-label={`View ${track.title} cards`}
              >
                {/* Dynamic Editorial Tech Cover Image with icon-grid fallback */}
                <ResourcesArchiveThumb
                  src={getAutoImage(track.id || track.title)}
                  alt={track.title}
                  acronym={track.acronym}
                  previewIcons={track.previewIcons}
                />

                {/* Content on Right */}
                <div className="resources-archive-item-content">
                  <div className="resources-archive-header-row">
                    <span className="resources-archive-category">{track.categoryLabel}</span>
                    {track.lastUpdated && (
                      <span className="resources-archive-updated">
                        Updated:{' '}
                        {new Date(track.lastUpdated).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  <h2 className="resources-archive-item-title">{track.title}</h2>

                  <p className="resources-archive-item-excerpt">{track.description}</p>

                  <footer className="resources-archive-item-footer">
                    <span className="resources-archive-action">Explore</span>
                    <span className="resources-archive-dot">·</span>
                    <span>{track.itemCount} items</span>
                    {track.techPreview && (
                      <>
                        <span className="resources-archive-dot">·</span>
                        <span className="resources-archive-tech-preview">{track.techPreview}</span>
                      </>
                    )}
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

export default ResourcesListArchive;
