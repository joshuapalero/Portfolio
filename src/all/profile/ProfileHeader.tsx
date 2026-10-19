import { MapPin } from 'lucide-react';
import { useGithubProfile } from './queries';
import { Skeleton, SkeletonGroup, Spinner } from '../ui';
import type { ProfileHeaderProps } from './types';
import './profile_header.css';

/**
 * Aurora Scharff Co-located Zero-CLS Profile Header Skeleton.
 * Faithfully mirrors the exact line-heights, margins, and typography of the loaded header.
 */
export function ProfileHeaderSkeleton({ className = '' }: { className?: string }) {
  return (
    <SkeletonGroup
      label="Loading profile information from GitHub..."
      className={`profile-header-text profile-header-skeleton-group ${className}`.trim()}
    >
      <div className="profile-skeleton-line profile-skeleton-name" aria-hidden="true">
        <Skeleton variant="text" width={240} height={32} />
      </div>
      <div className="profile-skeleton-line profile-skeleton-subtitle" aria-hidden="true">
        <Skeleton variant="text" width={200} height={20} />
      </div>
      <div className="profile-skeleton-line profile-skeleton-location" aria-hidden="true">
        <Skeleton variant="text" width={140} height={18} />
      </div>
    </SkeletonGroup>
  );
}

/**
 * ProfileHeader Component.
 *
 * Implements Aurora Scharff & TkDodo TanStack Query v5 declarative architecture:
 * 1. 100% Live synchronization from the user's GitHub account profile (bio and location).
 * 2. Shared cache entry with ProfilePhoto via TanStack Query's hierarchical key factory.
 * 3. Zero Cumulative Layout Shift (CLS) with exact-geometry skeleton states.
 * 4. Micro-sync indicator for non-disruptive background refetches.
 * 5. Resilient graceful degradation if offline or rate-limited.
 */
export default function ProfileHeader({
  username = 'joshuapalero',
  token,
  defaultName = 'Joshua Pasacay Palero',
  defaultBio = 'Software Engineer',
  defaultLocation = 'Manila, Philippines',
  className = '',
}: ProfileHeaderProps) {
  const cleanUsername = username.trim() || 'joshuapalero';
  const { data, isPending, isFetching } = useGithubProfile({
    username: cleanUsername,
    token,
  });

  if (isPending) {
    return <ProfileHeaderSkeleton className={className} />;
  }

  // Live values from GitHub account profile with resilient fallbacks
  const displayName = data?.name?.trim() || defaultName;
  const displayBio = data?.bio?.trim() || defaultBio;
  const displayLocation = data?.location?.trim() || defaultLocation;

  return (
    <div
      className={`profile-header-text ${className}`.trim()}
      aria-label="Profile information"
    >
      <div className="profile-header-name-row">
        <h1 className="name">{displayName}</h1>
        {isFetching && !isPending && (
          <span
            className="profile-sync-indicator"
            title="Syncing profile live from GitHub..."
            aria-label="Syncing profile live from GitHub..."
          >
            <Spinner size="sm" label="Syncing profile..." />
          </span>
        )}
      </div>

      <p className="sub-title" title="GitHub Bio">
        {displayBio}
      </p>

      {displayLocation && (
        <div className="location" title="Location">
          <MapPin size={16} className="location-icon" aria-hidden="true" />
          <span>{displayLocation}</span>
        </div>
      )}
    </div>
  );
}
