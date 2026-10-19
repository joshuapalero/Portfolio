import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { Spinner } from '../ui';
import type { GalleryImageProps } from './types';
import './gallery_image.css';

/**
 * GalleryImage handles asynchronous image loading with skeleton shimmer,
 * spinning loader indicator, graceful fade-in transitions, and error fallback.
 */
export function GalleryImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  showSpinner = true,
}: GalleryImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [errorSrc, setErrorSrc] = useState<string | null>(null);

  const isLoaded = loadedSrc === src;
  const hasError = errorSrc === src;

  return (
    <div className="gallery-image-wrapper">
      {/* ── Skeleton Shimmer and Loader (shown while image is loading) ─────── */}
      {!isLoaded && !hasError && (
        <div className="gallery-image-skeleton" aria-hidden="true">
          <div className="gallery-skeleton-shimmer" />
          {showSpinner && (
            <div className="gallery-skeleton-center">
              <Spinner size="sm" label="Loading gallery image..." />
            </div>
          )}
        </div>
      )}

      {/* ── Error Fallback: gracefully display fallback icon without broken layout ─ */}
      {hasError ? (
        <div className="gallery-image-fallback" role="img" aria-label={alt}>
          <ImageOff size={22} className="gallery-fallback-icon" />
          <span className="gallery-fallback-text">Photo unavailable</span>
        </div>
      ) : (
        <img
          key={src}
          src={src}
          alt={alt}
          loading={loading}
          decoding={decoding}
          referrerPolicy="no-referrer"
          className={`gallery-image-element ${isLoaded ? 'loaded' : 'loading'} ${className}`.trim()}
          onLoad={() => setLoadedSrc(src)}
          onError={() => setErrorSrc(src)}
        />
      )}
    </div>
  );
}

export default GalleryImage;
