import { useState, useCallback } from 'react';
import { useGithubProfile } from './queries';
import { useBio } from '../bio/queries';
import { DEFAULT_AVATAR_FALLBACK } from './fetchProfile';
import { Skeleton, Spinner } from '../ui';
import PixelTransition from './PixelTransition';
import type { ProfilePhotoProps } from './types';
import './profile_photo.css';

export default function ProfilePhoto({
  username = 'joshuapalero',
  token,
  alt = 'Joshua Pasacay Palero',
  fallbackSrc = DEFAULT_AVATAR_FALLBACK,
  secondarySrc,
  secondaryAlt,
  className = '',
  gridSize = 22,
  pixelColor,
  animationStepDuration = 0.95,
}: ProfilePhotoProps) {
  const cleanUsername = username.trim() || 'joshuapalero';
  const directUrl = `https://github.com/${encodeURIComponent(cleanUsername)}.png?size=400`;

  const { data, isPending: profilePending } = useGithubProfile({ username: cleanUsername, token });
  const { data: bioData, isPending: bioPending } = useBio({ username: cleanUsername, token, repo: 'About-me' });
  const isPending = profilePending || bioPending;

  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [secondaryLoaded, setSecondaryLoaded] = useState(false);
  const [bioImageIdx, setBioImageIdx] = useState(0);

  const bioImages = bioData?.images || [];

  // Cycle through About-me images on each completed transition deactivation
  const handleCycle = useCallback(() => {
    if (bioImages.length > 1) {
      setBioImageIdx((prev) => (prev + 1) % bioImages.length);
    }
    setSecondaryLoaded(false);
  }, [bioImages.length]);

  // Primary image URL (GitHub profile avatar)
  const primaryUrl = data?.avatarUrl || directUrl;

  let currentSrc: string;
  if (!failedUrls.has(primaryUrl)) {
    currentSrc = primaryUrl;
  } else if (!failedUrls.has(directUrl)) {
    currentSrc = directUrl;
  } else {
    currentSrc = fallbackSrc;
  }

  // Secondary transition image:
  // 1. Live image from the user's About-me repository (proxied via Cloudflare Worker)
  // 2. Custom secondarySrc prop if provided
  // 3. Current primary profile photo
  const activeBioImage = bioImages.length > 0 ? bioImages[bioImageIdx % bioImages.length] : null;

  let resolvedSecondarySrc: string;
  if (activeBioImage && !failedUrls.has(activeBioImage)) {
    resolvedSecondarySrc = activeBioImage;
  } else if (secondarySrc && !failedUrls.has(secondarySrc)) {
    resolvedSecondarySrc = secondarySrc;
  } else {
    resolvedSecondarySrc = currentSrc;
  }

  const handleError = () => {
    setFailedUrls((prev) => {
      const next = new Set(prev);
      next.add(currentSrc);
      return next;
    });
  };

  const handleSecondaryError = () => {
    setFailedUrls((prev) => {
      const next = new Set(prev);
      next.add(resolvedSecondarySrc);
      return next;
    });
  };

  const showSkeleton = !isLoaded || isPending;
  const displayName = data?.name?.trim() || alt;

  const ariaLabel = activeBioImage
    ? `${displayName} profile photo. Hover or tap to transition to About-me photo (${bioImageIdx + 1} of ${bioImages.length}).`
    : `${displayName} profile photo. Hover or tap to transition.`;

  const resolvedSecondaryAlt = secondaryAlt || `${displayName} — About-me photo`;

  return (
    <div className="profile-photo-container">
      {showSkeleton && (
        <div className="profile-photo-skeleton-wrap" aria-hidden="true">
          <Skeleton
            variant="rounded"
            className="profile-photo-skeleton"
          />
          <div className="profile-photo-spinner-overlay">
            <Spinner size="md" label="Loading profile avatar..." />
          </div>
        </div>
      )}
      <PixelTransition
        gridSize={gridSize}
        pixelColor={pixelColor}
        animationStepDuration={animationStepDuration}
        className={`profile-photo-transition ${className}`.trim()}
        ariaLabel={ariaLabel}
        onCycle={handleCycle}
        firstContent={
          <img
            src={currentSrc}
            className={`image profile-photo ${isLoaded ? 'loaded' : 'loading'}`.trim()}
            alt={displayName}
            width={190}
            height={210}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            onLoad={() => setIsLoaded(true)}
            onError={handleError}
          />
        }
        secondContent={
          <img
            src={resolvedSecondarySrc}
            className={`image profile-photo ${secondaryLoaded ? 'loaded' : 'loading'}`.trim()}
            alt={resolvedSecondaryAlt}
            width={190}
            height={210}
            loading="eager"
            decoding="async"
            onLoad={() => setSecondaryLoaded(true)}
            onError={handleSecondaryError}
          />
        }
      />
    </div>
  );
}
