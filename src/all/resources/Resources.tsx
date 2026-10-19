import { useState, useMemo, type MouseEvent } from 'react';
import { ArrowRight, BookOpen, RefreshCw } from 'lucide-react';
import type { ResourcesProps } from './types';
import { useSuspenseResources } from './queries';
import { buildResourceTracks } from './track_helpers';
import { Skeleton, SkeletonGroup, Spinner } from '../ui';
import Kinetic from '@/components/registry/kinetic/kinetic';
import './resources.css';

/**
 * Aurora Scharff Co-located Zero-CLS Front-Page Resources Skeleton Component.
 */
export function ResourcesSkeleton() {
  return (
    <SkeletonGroup
      label="Loading developer resources..."
      className="resources-loading-group"
    >
      {[1, 2, 3].map((key) => (
        <div key={key} className="resources-row-container" aria-hidden="true">
          <div className="resources-row resources-row--skeleton">
            <div className="resources-col-badge">
              <Skeleton variant="rounded" width={42} height={18} />
            </div>
            <div className="resources-col-name">
              <Skeleton variant="text" width={140} height={14} />
            </div>
            <div className="resources-col-desc">
              <Skeleton variant="text" width="80%" height={14} />
            </div>
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

export function Resources({
  sectionNumber = '07',
  sectionTitle = 'Resources',
  subtitle: propSubtitle,
  username = 'joshuapalero',
  token,
  onViewAllResources,
  onSelectTrack,
}: ResourcesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── 100% Dynamic Live Data via TanStack Query v5 directly from GitHub ─────
  const { data, isFetching, isError, refetch } = useSuspenseResources({ username, token });
  const isPending = false;

  const dynamicSubtitle = propSubtitle || data?.subtitle;
  const items = useMemo(() => data?.items ?? [], [data?.items]);

  // Construct curated tracks (Full Stack Resources, Engineering Personalities, Web References)
  const tracks = useMemo(() => buildResourceTracks(items, data?.lastUpdated), [items, data?.lastUpdated]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };



  const handleAllClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onViewAllResources) {
      e.preventDefault();
      onViewAllResources();
    }
  };

  const handleTrackClick = (e: MouseEvent<HTMLAnchorElement>, trackId: string) => {
    if (onSelectTrack) {
      e.preventDefault();
      onSelectTrack(trackId);
    }
  };

  return (
    <section className="resources-section" aria-label="Developer Resources">
      {/* Minimalist Section Header with Live Sync Indicator */}
      <div className="resources-header">
        <div className="resources-title-group">
          <div className="resources-title-label">
            <span>{sectionNumber} —</span>{' '}
            <span className="resources-word">{sectionTitle}</span>
            {isFetching && !isPending && (
              <span className="resources-revalidating-wrapper" title="Synchronizing live resources...">
                <Spinner size="sm" label="Syncing resources data" className="resources-revalidating-spinner" />
              </span>
            )}
          </div>
          {dynamicSubtitle ? (
            <div className="resources-subtitle">
              <Kinetic
                text={dynamicSubtitle}
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
          ) : null}
        </div>

        <a
          href="/resources"
          onClick={handleAllClick}
          className="resources-history-link"
          title="Explore Full Developer Resources Directory"
        >
          <span>see resources</span>
          <ArrowRight size={14} className="resources-arrow" />
        </a>
      </div>

      {/* ── UNIFIED REPOSITORY RESOURCES TABLE (FRONT PAGE TABLE UI FORMAT) ── */}
      <div className="resources-table" role="region" aria-label="Developer resources tracks">
        {isPending ? (
          <ResourcesSkeleton />
        ) : isError ? (
          <div className="resources-error-container" role="alert">
            <div className="resources-error-box">
              <BookOpen size={20} className="resources-error-icon" />
              <div className="resources-error-content">
                <span className="resources-error-title">Unable to synchronize resources</span>
                <p className="resources-error-desc">
                  Could not load dynamic resources from your repository.
                </p>
                <button
                  type="button"
                  className="resources-retry-btn"
                  onClick={() => void refetch()}
                >
                  <RefreshCw size={12} />
                  <span>Retry</span>
                </button>
              </div>
            </div>
          </div>
        ) : tracks.length === 0 ? (
          <div className="resources-empty-container">
            <div className="resources-empty-box">
              <BookOpen size={20} className="resources-empty-icon" />
              <div className="resources-empty-content">
                <span className="resources-empty-title">No resources found</span>
                <p className="resources-empty-desc">
                  Resources added to your GitHub repository will appear here automatically.
                </p>
              </div>
            </div>
          </div>
        ) : (
          tracks.map((track) => {
            const isExpanded = expandedId === track.id;
            const previewTags = track.techPreview ? track.techPreview.split(' · ') : [];

            return (
              <div key={track.id} className="resources-row-container">
                <div
                  className={`resources-row ${isExpanded ? 'active' : ''}`}
                  onClick={() => toggleExpand(track.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(track.id);
                    }
                  }}
                >
                  <div className="resources-col-badge">
                    {track.acronym}
                  </div>
                  <div className="resources-col-name">{track.title}</div>
                  <div className="resources-col-desc">{track.categoryLabel}</div>
                </div>

                {/* Expandable details */}
                {isExpanded && (
                  <div className="resources-expanded-body">
                    {track.description && (
                      <p className="resources-expanded-desc">{track.description}</p>
                    )}

                    {previewTags.length > 0 && (
                      <div className="resources-expanded-tags" aria-label="Included technologies">
                        {previewTags.map((tag) => (
                          <span key={tag} className="resources-expanded-tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="resources-expanded-links">
                      <a
                        href={`/resources/${track.id}`}
                        className="resources-link-action primary"
                        title={`Explore ${track.title}`}
                        onClick={(e) => handleTrackClick(e, track.id)}
                      >
                        <span>Explore {track.title} ({track.itemCount} Items)</span>
                        <ArrowRight size={12} aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default Resources;
