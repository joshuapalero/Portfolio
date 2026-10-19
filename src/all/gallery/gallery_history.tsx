import { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ExternalLink,
  ThumbsUp,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  Camera,
} from 'lucide-react';
import type { GalleryHistoryProps, FacebookPhoto } from './types';
import { extractFacebookPhotos, CURATED_SHOWCASE_PHOTOS } from './facebook_photos';
import { GalleryImage } from './GalleryImage';
import { Spinner, useOnlineStatus, HistoryFooter } from '../ui';
import Kinetic from '@/components/registry/kinetic/kinetic';
import './gallery_history.css';

export function GalleryHistory({
  subtitle,
  posts = [],
  photos: propPhotos,
  isPending = false,
  isError = false,
  onRetry,
  onBack,
}: GalleryHistoryProps) {
  // ── Reactive connectivity status ─────────────────────────────────────────
  const isOnline = useOnlineStatus();
  const isOffline = !isOnline;

  // ── Source photos: If offline, ZERO visual images for offline ─────────────
  const pageUrl = useMemo(() => { try { if (posts.length > 0 && posts[0].permalinkUrl) { const urlObj = new URL(posts[0].permalinkUrl); const username = urlObj.pathname.split('/')[1]; if (username && username !== 'permalink.php') return 'https://www.facebook.com/' + username; } } catch { /* ignore invalid URL */ } return 'https://www.facebook.com/profile.php?id=61593929556688'; }, [posts]);

  const allPhotos = useMemo<readonly FacebookPhoto[]>(() => {
    // When offline, do NOT display any fallback visual images
    if (isOffline) return [];
    if (propPhotos && propPhotos.length > 0) return propPhotos;
    const extracted = extractFacebookPhotos(posts);
    if (extracted.length > 0) return extracted;
    return isError ? [] : CURATED_SHOWCASE_PHOTOS;
  }, [propPhotos, posts, isOffline, isError]);

  // ── Maintain skeleton state for 2 seconds when online, and FOREVER when offline ──
  const [minLoading, setMinLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleRetry = () => {
    setMinLoading(true);
    setTimeout(() => {
      setMinLoading(false);
    }, 2000);
    onRetry?.();
  };

  // If there is no internet (isOffline), gallery stays FOREVER in loader & skeleton state
  const showSkeleton = isOffline || isPending || minLoading;

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <article className="gallery-history-container" aria-label="Portfolio Gallery Page">
      {/* ── Back to Home Button ─────────────────────────────────────────────── */}
      {onBack && (
        <button
          type="button"
          className="gallery-history-back-btn"
          onClick={onBack}
          aria-label="Back to home"
        >
          <ArrowLeft size={16} />
          <span>Back to home</span>
        </button>
      )}

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="gallery-history-header">
        <div className="gallery-history-title-wrap">
          <h1 className="gallery-history-title">gallery</h1>
          {showSkeleton ? (
            <span
              className="gallery-count-pill gallery-loading-pill"
              role="status"
              aria-label="Loading photos"
            >
              <Spinner size="sm" />
              <span>{isOffline ? 'Connecting...' : 'Loading photos...'}</span>
            </span>
          ) : (
            <span className="gallery-count-pill">
              {allPhotos.length} {allPhotos.length === 1 ? 'picture' : 'pictures'}
            </span>
          )}
        </div>

        <div className="gallery-history-subtitle">
          <Kinetic
            text={subtitle || 'life inside and outside IDE.'}
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
      </header>

      {/* ── Error Banner (if worker is down) ─────────────────────────────────── */}
      {!showSkeleton && isError && (
        <div className="gallery-state-card gallery-error-card" role="alert" style={{ marginBottom: 24 }}>
          <div className="gallery-state-icon">
            <AlertCircle size={22} />
          </div>
          <div className="gallery-state-content">
            <p className="gallery-state-title">Empty</p>
            <p className="gallery-state-message">
              No photos available.
            </p>
          </div>
          {onRetry && (
            <button
              type="button"
              className="gallery-retry-btn"
              onClick={handleRetry}
              aria-label="Retry loading live Facebook photos"
            >
              <RefreshCw size={13} />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* ── Cards View ──────────────────────────────────────────────────────── */}
      {showSkeleton ? (
        <div
          className="gallery-history-grid gallery-skeleton-grid"
          role="status"
          aria-busy="true"
          aria-label="Loading gallery photos"
        >
          <span className="sr-only">Loading gallery archive photos...</span>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((key) => (
            <div key={key} className="gallery-page-card gallery-skeleton-page-card" aria-hidden="true">
              {/* Picture skeleton */}
              <div className="gallery-card-image-wrap gallery-skeleton-image-wrap">
                <div className="gallery-skeleton-shimmer" />
              </div>

              {/* Card Content Body Skeleton */}
              <div className="gallery-card-body">
                {/* Meta Row */}
                <div className="gallery-card-meta-row">
                  <div className="gallery-skeleton-line gallery-skeleton-meta-place" />
                  <div className="gallery-skeleton-line gallery-skeleton-meta-date" />
                </div>

                {/* Description Lines */}
                <div className="gallery-card-desc-wrap gallery-skeleton-desc-wrap">
                  <div className="gallery-skeleton-line gallery-skeleton-desc-line-1" />
                  <div className="gallery-skeleton-line gallery-skeleton-desc-line-2" />
                  <div className="gallery-skeleton-line gallery-skeleton-desc-line-3" />
                </div>

                {/* Footer with stats & link */}
                <footer className="gallery-card-footer gallery-skeleton-footer">
                  <div className="gallery-skeleton-stats">
                    <div className="gallery-skeleton-pill gallery-skeleton-stat-pill" />
                    <div className="gallery-skeleton-pill gallery-skeleton-stat-pill" />
                  </div>
                  <div className="gallery-skeleton-pill gallery-skeleton-link-pill" />
                </footer>
              </div>
            </div>
          ))}
        </div>
      ) : allPhotos.length === 0 ? (
        <div className="gallery-empty-state">
          <Camera size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
          <h3>Empty</h3>
          <p>No photos available.</p>
        </div>
      ) : (
        <div className="gallery-history-grid">
          {allPhotos.map((photo) => {
            const isExpanded = Boolean(expandedCards[photo.id]);
            const fullDesc = photo.description || photo.caption || '';
            const isLong = fullDesc.length > 220;

            const displayDesc = isLong && !isExpanded ? `${fullDesc.slice(0, 210).trimEnd()}...` : fullDesc;

            return (
              <article key={photo.id} className="gallery-page-card">
                {/* ── Picture: clean display with skeleton & loader ─── */}
                <div className="gallery-card-image-wrap">
                  <GalleryImage
                    src={photo.imageUrl}
                    alt={photo.caption}
                    loading="lazy"
                    decoding="async"
                    className="gallery-card-image"
                  />
                </div>

                {/* ── Card Content Body: vertically adjusts with description ── */}
                <div className="gallery-card-body">
                  {/* Name of Place & Date */}
                  <div className="gallery-card-meta-row">
                    {photo.place && (
                      <div className="gallery-card-meta-item" title={`Location: ${photo.place}`}>
                        <MapPin size={12} className="gallery-card-meta-icon" />
                        <span className="gallery-card-place-text">{photo.place}</span>
                      </div>
                    )}

                    {photo.date && (
                      <time
                        className="gallery-card-meta-item"
                        dateTime={photo.rawDate}
                        title={`Date: ${photo.date}`}
                      >
                        <Clock size={12} className="gallery-card-meta-icon" />
                        <span>{photo.date}</span>
                      </time>
                    )}
                  </div>

                  {/* Description: Vertically expands the card ───────────────── */}
                  {displayDesc && (
                    <div className="gallery-card-desc-wrap">
                      <p className="gallery-card-description">{displayDesc}</p>
                      {isLong && (
                        <button
                          type="button"
                          className="gallery-card-expand-btn"
                          onClick={() => toggleExpand(photo.id)}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? 'Show less' : 'Read full description'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Footer with social engagement & permalink ──────────────── */}
                  <footer className="gallery-card-footer">
                    <div className="gallery-card-stats">
                      {photo.reactionsCount > 0 && (
                        <span className="gallery-card-stat" title="Reactions">
                          <ThumbsUp size={11} />
                          <span>{photo.reactionsCount}</span>
                        </span>
                      )}
                      {photo.commentsCount > 0 && (
                        <span className="gallery-card-stat" title="Comments">
                          <MessageCircle size={11} />
                          <span>{photo.commentsCount}</span>
                        </span>
                      )}
                    </div>

                    {photo.permalinkUrl && (
                      <a
                        href={photo.permalinkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="gallery-card-link"
                        title="View post on Facebook"
                      >
                        <span>Facebook</span>
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </footer>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <HistoryFooter
        externalUrl={pageUrl} platform="facebook"
        externalText="View on Facebook"
      />
    </article>
  );
}

export default GalleryHistory;
