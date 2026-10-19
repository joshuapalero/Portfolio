import { useState, useMemo } from 'react';
import {
  ExternalLink,
  ThumbsUp,
  MessageCircle,
  Camera,
  AlertCircle,
  RefreshCw,
  Play,
  Pause,
  ArrowRight,
} from 'lucide-react';
import type { GalleryProps, FacebookPhoto } from './types';
import { extractFacebookPhotos, CURATED_SHOWCASE_PHOTOS } from './facebook_photos';
import { GalleryImage } from './GalleryImage';
import { Spinner, Skeleton, useOnlineStatus } from '../ui';
import Kinetic from '@/components/registry/kinetic/kinetic';
import './gallery.css';

/** Minimum number of items in a loop to ensure uninterrupted continuous sliding */
const MIN_LOOP_ITEMS = 6;

/** Sample placeholder labels when no photos are uploaded */
const PLACEHOLDER_ITEMS = [
  { id: 'ph-1', title: 'Portfolio Showcase 01' },
  { id: 'ph-2', title: 'Project Preview 02' },
  { id: 'ph-3', title: 'Featured Work 03' },
  { id: 'ph-4', title: 'Development Snap 04' },
  { id: 'ph-5', title: 'Design Highlight 05' },
  { id: 'ph-6', title: 'Engineering 06' },
];

export default function Gallery({
  sectionNumber = '06',
  sectionTitle = 'Gallery',
  subtitle,
  posts = [],
  isPending = false,
  isError = false,
  error = null,
  onRetry,
  onViewAllGallery,
}: GalleryProps) {
  // ── Reactive connectivity status ─────────────────────────────────────────
  const isOnline = useOnlineStatus();
  const isOffline = !isOnline;

  // ── Photos: If offline, strict requirement is: ZERO visual images for offline ──
  const photos = useMemo<readonly FacebookPhoto[]>(() => {
    // When offline, do NOT display any fallback visual images
    if (isOffline) return [];
    const extracted = extractFacebookPhotos(posts);
    if (extracted.length > 0) return extracted;
    return isError ? [] : CURATED_SHOWCASE_PHOTOS;
  }, [posts, isOffline, isError]);

  const handleRetry = () => {
    onRetry?.();
  };

  // Trust React Query's isPending directly — no artificial minimum timer needed.
  // When offline, gallery stays FOREVER in skeleton state until connectivity is restored.
  const showSkeleton = isOffline || isPending;

  // ── Animation Play / Pause state ──────────────────────────────────────────
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // ── Prepare items for seamless infinite marquee sliding to the right ────────
  const loopedPhotos = useMemo(() => {
    if (photos.length === 0) return [];
    let items = [...photos];
    while (items.length < MIN_LOOP_ITEMS) {
      items = [...items, ...photos];
    }
    // Duplicate once for seamless -50% to 0% infinite loop
    return [...items, ...items];
  }, [photos]);

  const loopedPlaceholders = useMemo(() => {
    return [...PLACEHOLDER_ITEMS, ...PLACEHOLDER_ITEMS];
  }, []);

  return (
    <section className="gallery-section" aria-label="Portfolio Gallery">
      {/* ── Section Header ──────────────────────────────────────────────────── */}
      <header className="gallery-header">
        <div className="gallery-title-group">
          <div className="gallery-title-label">
            <span>{sectionNumber} —</span>
            <span className="gallery-word">{sectionTitle}</span>
          </div>
          {subtitle && (
            <div className="gallery-subtitle">
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
                shadow={false}
              />
            </div>
          )}
        </div>

        <div className="gallery-header-meta">
          {showSkeleton && (
            <span
              className="gallery-count-badge gallery-loading-badge"
              role="status"
              aria-label="Loading photos"
            >
              <Spinner size="sm" />
              <span>{isOffline ? 'Connecting...' : 'Loading...'}</span>
            </span>
          )}

          {!showSkeleton && !isError && photos.length > 0 && (
            <span className="gallery-count-badge">
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </span>
          )}

          {onViewAllGallery && (
            <button
              type="button"
              className="gallery-view-all-btn"
              onClick={onViewAllGallery}
              title="View all gallery pictures in detail"
              aria-label="View all gallery pictures"
            >
              <span>View all</span>
              <ArrowRight size={12} />
            </button>
          )}

          {/* Toggle Animation Play/Pause */}
          <button
            type="button"
            className={`gallery-control-btn ${!isPlaying ? 'paused' : ''}`}
            onClick={() => setIsPlaying((prev) => !prev)}
            title={isPlaying ? 'Pause horizontal slider' : 'Resume horizontal slider'}
            aria-label={isPlaying ? 'Pause gallery slider' : 'Resume gallery slider'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
          </button>
        </div>
      </header>

      {/* ── Error State Card (if worker failed) ──────────────────────────────── */}
      {!showSkeleton && isError && (
        <div className="gallery-state-card gallery-error-card" role="alert">
          <div className="gallery-state-icon">
            <AlertCircle size={24} />
          </div>
          <div className="gallery-state-content">
            <p className="gallery-state-title">Facebook photos unavailable</p>
            <p className="gallery-state-message">
              {error?.message || 'Displaying placeholder gallery while proxy reconnects.'}
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              className="gallery-retry-btn"
              onClick={handleRetry}
              aria-label="Retry loading Facebook photos"
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* ── 100% Horizontal Slider Track ────────────────────────────────────── */}
      <div
        className="gallery-slider-container"
        role="region"
        aria-label="Gallery horizontal slider"
      >
        {/* Subtle edge fade overlays matching portfolio background */}
        <div className="gallery-fade-left" aria-hidden="true" />
        <div className="gallery-fade-right" aria-hidden="true" />

        {/* ── Case 1: Loading Skeleton Slider ──────────────────────────────── */}
        {showSkeleton && (
          <div
            className={`gallery-slider-track ${!isPlaying ? 'paused' : ''}`}
            role="status"
            aria-busy="true"
            aria-label="Loading gallery images"
          >
            <span className="sr-only">Loading showcase gallery photos...</span>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((key) => (
              <div key={key} className="gallery-card-item gallery-skeleton-card" aria-hidden="true">
                <div className="gallery-skeleton-inner">
                  <div className="gallery-skeleton-shimmer" />
                  <div className="gallery-skeleton-overlay">
                    <Skeleton variant="text" width="78%" height={10} animation="pulse" />
                    <div className="gallery-skeleton-row">
                      <Skeleton variant="rounded" width={50} height={9} animation="pulse" />
                      <Skeleton variant="rounded" width={32} height={9} animation="pulse" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Case 2: Live Photos Slider (Continuous Slide to Right) ─────────── */}
        {!showSkeleton && photos.length > 0 && (
          <div
            className={`gallery-slider-track ${!isPlaying ? 'paused' : ''}`}
          >
            {loopedPhotos.map((photo, index) => (
              <article
                key={`${photo.id}-${index}`}
                className="gallery-card-item gallery-photo-card"
              >
                <GalleryImage
                  src={photo.imageUrl}
                  alt={photo.caption}
                  loading="lazy"
                  decoding="async"
                  className="gallery-photo-img"
                />

                <div className="gallery-photo-overlay">
                  <div className="gallery-photo-overlay-top">
                    {photo.permalinkUrl && (
                      <a
                        href={photo.permalinkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="gallery-photo-fb-link"
                        title="View post on Facebook"
                        aria-label="View on Facebook"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>

                  <div className="gallery-photo-overlay-bottom">
                    <p className="gallery-photo-caption">{photo.caption}</p>
                    <div className="gallery-photo-meta">
                      <span>{photo.date}</span>
                      <div className="gallery-photo-stats">
                        {photo.reactionsCount > 0 && (
                          <span className="gallery-photo-stat-item">
                            <ThumbsUp size={11} />
                            <span>{photo.reactionsCount}</span>
                          </span>
                        )}
                        {photo.commentsCount > 0 && (
                          <span className="gallery-photo-stat-item">
                            <MessageCircle size={11} />
                            <span>{photo.commentsCount}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* ── Case 3: Placeholder Slider (When no uploaded photos exist yet) ─── */}
        {!showSkeleton && photos.length === 0 && (
          <div
            className={`gallery-slider-track ${!isPlaying ? 'paused' : ''}`}
          >
            {loopedPlaceholders.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="gallery-card-item gallery-placeholder-card"
              >
                <div className="gallery-placeholder-inner">
                  <div className="gallery-placeholder-icon-wrap">
                    <Camera size={22} className="gallery-placeholder-icon" />
                  </div>
                  <span className="gallery-placeholder-badge">Portfolio</span>
                  <span className="gallery-placeholder-title">{item.title}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export { Gallery };
