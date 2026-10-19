import { useMemo, useState, useEffect } from 'react';
import {
  ArrowLeft,
  ExternalLink,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import type {
  ResourcesHistoryProps,
  ResourceItem,
} from './types';
import { useSuspenseResources } from './queries';
import {
  isAiResource,
  isPersonalityResource,
  isReferenceResource,
  isFullstackResource,
} from './fetchResources';
import { resolveResourceIcon } from './resolve_resource_icon';
import { GitHubIcon } from './resource_icons';
import { Skeleton, SkeletonGroup } from '../ui';
import { LikeButton } from '../live_viewers';
import Kinetic from '@/components/registry/kinetic/kinetic';
import './resources_history.css';

/**
 * Responsive Column Count Hook (identical to Recommendations):
 * Desktop: 3 columns (> 860px)
 * Tablet: 2 columns (561px - 860px)
 * Mobile: 1 column (<= 560px)
 */
function useColumnCount(): number {
  const [columnCount, setColumnCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 3;
    if (window.matchMedia('(max-width: 560px)').matches) return 1;
    if (window.matchMedia('(max-width: 860px)').matches) return 2;
    return 3;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mqlSmall = window.matchMedia('(max-width: 560px)');
    const mqlMedium = window.matchMedia('(max-width: 860px)');

    const updateCount = () => {
      if (mqlSmall.matches) {
        setColumnCount(1);
      } else if (mqlMedium.matches) {
        setColumnCount(2);
      } else {
        setColumnCount(3);
      }
    };

    mqlSmall.addEventListener('change', updateCount);
    mqlMedium.addEventListener('change', updateCount);
    return () => {
      mqlSmall.removeEventListener('change', updateCount);
      mqlMedium.removeEventListener('change', updateCount);
    };
  }, []);

  return columnCount;
}

/**
 * Aurora Scharff Co-located Zero-CLS Skeleton for Unified Resources Masonry.
 */
export function ResourcesHistorySkeleton({ columnCount = 3 }: { columnCount?: number }) {
  return (
    <SkeletonGroup
      label="Loading developer resources directory"
      className="resources-history-loading-group"
    >
      <div className="resources-cards-masonry" aria-hidden="true" style={{ marginTop: 24 }}>
        {Array.from({ length: columnCount }).map((_, colIdx) => (
          <div key={colIdx} className="resources-cards-col">
            {[1, 2, 3].map((key) => (
              <div key={key} className="resources-tech-card" style={{ minHeight: 180 }}>
                <div className="resources-tech-card-header">
                  <div className="resources-tech-brand">
                    <Skeleton variant="rounded" width={34} height={34} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <Skeleton variant="text" width={90} height={15} />
                      <Skeleton variant="text" width={60} height={11} />
                    </div>
                  </div>
                </div>
                <Skeleton variant="text" width="85%" height={13} style={{ margin: '8px 0 4px 0' }} />
                <Skeleton variant="text" width="100%" height={12} />
                <Skeleton variant="text" width="70%" height={12} style={{ marginTop: 4 }} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </SkeletonGroup>
  );
}

export function ResourcesHistory({
  username = 'joshuapalero',
  token,
  trackId,
  backLabel = 'Back to resources',
  onBack,
}: ResourcesHistoryProps) {
  // ── 100% Dynamic Live Data via TanStack Query v5 directly from GitHub Repository ──
  const { data, isError, refetch } = useSuspenseResources({ username, token });

  // since useSuspenseQuery guarantees data and suspends while fetching
  const isPending = false;

  const rawItems = useMemo(() => data?.items ?? [], [data]);

  // Filter items by trackId if specified
  const filteredItems = useMemo(() => {
    if (!trackId || trackId === 'all') return rawItems;
    if (trackId === 'fullstack') {
      return rawItems.filter(isFullstackResource);
    }
    if (trackId === 'ai-engineering') {
      return rawItems.filter(isAiResource);
    }
    if (trackId === 'personalities') {
      return rawItems.filter(isPersonalityResource);
    }
    if (trackId === 'references') {
      return rawItems.filter(isReferenceResource);
    }
    return rawItems.filter(
      (item) =>
        item.category.toLowerCase().includes(trackId.toLowerCase()) ||
        item.categoryLabel.toLowerCase().includes(trackId.toLowerCase()),
    );
  }, [rawItems, trackId]);

  // Responsive column count for 1-2-3 Left-to-Right masonry distribution
  const columnCount = useColumnCount();

  // ── 1. Full-Stack / Primary Items ──
  const fullstackItems = useMemo(() => {
    if (trackId && trackId !== 'all') {
      if (trackId === 'fullstack') return filteredItems;
      if (trackId === 'ai-engineering') return [];
      return filteredItems;
    }
    return rawItems.filter((item) => !isAiResource(item));
  }, [filteredItems, rawItems, trackId]);

  // ── 2. AI Engineering Items ──
  const aiItems = useMemo(() => {
    if (trackId && trackId !== 'all') {
      if (trackId === 'ai-engineering') return filteredItems;
      return [];
    }
    return rawItems.filter(isAiResource);
  }, [filteredItems, rawItems, trackId]);

  // ── 1-2-3 Left-to-Right Masonry Column Distributions ──
  const fullstackColumns = useMemo(() => {
    const cols: ResourceItem[][] = Array.from({ length: columnCount }, () => []);
    fullstackItems.forEach((item, index) => {
      cols[index % columnCount].push(item);
    });
    return cols;
  }, [fullstackItems, columnCount]);

  const aiColumns = useMemo(() => {
    const cols: ResourceItem[][] = Array.from({ length: columnCount }, () => []);
    aiItems.forEach((item, index) => {
      cols[index % columnCount].push(item);
    });
    return cols;
  }, [aiItems, columnCount]);

  const pageTitle = useMemo(() => {
    if (!trackId || trackId === 'all') return 'developer resources';
    if (trackId === 'fullstack' || trackId === 'full-stack') return 'full-stack resources';
    if (trackId === 'ai-engineering') return 'ai engineering resources';
    if (trackId === 'personalities' || trackId.includes('masterclasses')) return 'engineering masterclasses & visual guides';
    if (trackId === 'references' || trackId.includes('specifications')) return 'web standards & reference specifications';
    return `${trackId.replace(/-/g, ' ')} resources`;
  }, [trackId]);



  // Derive the dynamic subtitle. If viewing a specific section, use its parsed description
  const dynamicSubtitle = useMemo(() => {
    if (trackId && trackId !== 'all' && filteredItems.length > 0) {
      return filteredItems[0].sectionDescription || data?.subtitle;
    }
    return data?.subtitle;
  }, [trackId, filteredItems, data?.subtitle]);

  return (
    <article className="resources-history-container" aria-label="Developer Resources Directory">
      {/* Top Navigation Bar: Back Button + Reactions Like Button */}
      <div className="resources-history-top-bar">
        {onBack ? (
          <button
            type="button"
            className="resources-history-back-btn"
            onClick={onBack}
            aria-label={backLabel}
          >
            <ArrowLeft size={16} />
            <span>{backLabel}</span>
          </button>
        ) : (
          <span />
        )}

        <LikeButton sectionId="resources" className="resources-page-like-btn" />
      </div>

      {/* Header: Dribbble-Inspired Minimalist Resources Hub */}
      <header className="resources-history-header">
        <h2 className="resources-history-title">{pageTitle}</h2>
        <div className="resources-history-subtitle">
          <Kinetic
            text={
              dynamicSubtitle ||
              'my curated directory of production full-stack web technologies, libraries, and architectural documentation synchronized from the github repository.'
            }
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

      {/* ── MAIN UNIFIED CONTENT ── */}
      {isPending ? (
        <ResourcesHistorySkeleton columnCount={columnCount} />
      ) : isError ? (
        <div className="resources-history-error-container" role="alert">
          <div className="resources-history-error-box">
            <BookOpen size={24} className="resources-history-error-icon" />
            <div className="resources-history-error-content">
              <span className="resources-history-error-title">Failed to load developer resources</span>
              <p className="resources-history-error-desc">
                We encountered an error synchronizing resources from your repository.
              </p>
              <button
                type="button"
                className="resources-history-retry-btn"
                onClick={() => void refetch()}
              >
                <RefreshCw size={12} />
                <span>Try again</span>
              </button>
            </div>
          </div>
        </div>
      ) : fullstackItems.length === 0 && aiItems.length === 0 ? (
        <div className="resources-history-error-container">
          <div className="resources-history-error-box">
            <BookOpen size={24} className="resources-history-error-icon" />
            <div className="resources-history-error-content">
              <span className="resources-history-error-title">No resources found</span>
              <p className="resources-history-error-desc">
                Resources added to your GitHub repository README.md will appear here automatically.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="resources-unified-layout">
          {/* ── 1. FULL-STACK ENGINEERING & WEB ARCHITECTURE CARDS (FIRST IN TOP) ── */}
          {fullstackItems.length > 0 && (
            <section className="resources-unified-section" aria-label="Full-Stack Technologies">
              <div className="resources-cards-masonry" role="list">
                {fullstackColumns.map((colItems, colIdx) => (
                  <div key={`fs-col-${colIdx}`} className="resources-cards-col">
                    {colItems.map((item: ResourceItem) => {
                      const iconEl = item.icon || resolveResourceIcon(item);

                      return (
                        <article
                          key={item.id}
                          className="resources-tech-card"
                          role="listitem"
                          aria-label={`${item.name} resource`}
                        >
                          <div>
                            <div className="resources-tech-card-header">
                              <div className="resources-tech-brand">
                                <div className="resources-tech-icon-box" aria-hidden="true">
                                  {iconEl}
                                </div>
                                <div className="resources-tech-title-group">
                                  <h3 className="resources-tech-name">{item.name}</h3>
                                  <span className="resources-tech-category">{item.categoryLabel}</span>
                                </div>
                              </div>
                            </div>

                            <h4 className="resources-tech-tagline">{item.tagline}</h4>
                            {item.description && item.description.trim() !== item.tagline.trim() && (
                              <p className="resources-tech-desc">{item.description}</p>
                            )}

                            {item.tags.length > 0 && (
                              <div className="resources-tech-tags" aria-label="Tech tags">
                                {item.tags.map((tag) => (
                                  <span key={tag} className="resources-tech-tag-pill">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <footer className="resources-tech-footer">
                            {item.websiteUrl && (
                              <a
                                href={item.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resources-tech-link primary"
                                title={`Visit ${item.name} website`}
                              >
                                <span>{item.visitLabel || 'Visit'}</span>
                                <ExternalLink size={11} aria-hidden="true" />
                              </a>
                            )}

                            {item.docsUrl && (
                              <a
                                href={item.docsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resources-tech-link"
                                title={`Open ${item.name} documentation`}
                              >
                                <BookOpen size={11} aria-hidden="true" />
                                <span>Docs</span>
                              </a>
                            )}

                            {item.githubUrl && (
                              <a
                                href={item.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resources-tech-link"
                                title={`Open ${item.name} on GitHub`}
                              >
                                <GitHubIcon width={12} height={12} aria-hidden="true" />
                                <span>GitHub</span>
                              </a>
                            )}
                          </footer>
                        </article>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── 2. AI ENGINEERING & LLM SYSTEMS CARDS (SECOND) ── */}
          {aiItems.length > 0 && (
            <section className="resources-unified-section" aria-label="AI Engineering and LLM Systems">
              <div className="resources-cards-masonry" role="list">
                {aiColumns.map((colItems, colIdx) => (
                  <div key={`ai-col-${colIdx}`} className="resources-cards-col">
                    {colItems.map((item: ResourceItem) => {
                      const iconEl = item.icon || resolveResourceIcon(item);

                      return (
                        <article
                          key={item.id}
                          className="resources-tech-card"
                          role="listitem"
                          aria-label={`${item.name} resource`}
                        >
                          <div>
                            <div className="resources-tech-card-header">
                              <div className="resources-tech-brand">
                                <div className="resources-tech-icon-box" aria-hidden="true">
                                  {iconEl}
                                </div>
                                <div className="resources-tech-title-group">
                                  <h3 className="resources-tech-name">{item.name}</h3>
                                  <span className="resources-tech-category">{item.categoryLabel}</span>
                                </div>
                              </div>
                            </div>

                            <h4 className="resources-tech-tagline">{item.tagline}</h4>
                            {item.description && item.description.trim() !== item.tagline.trim() && (
                              <p className="resources-tech-desc">{item.description}</p>
                            )}

                            {item.tags.length > 0 && (
                              <div className="resources-tech-tags" aria-label="Tech tags">
                                {item.tags.map((tag) => (
                                  <span key={tag} className="resources-tech-tag-pill">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <footer className="resources-tech-footer">
                            {item.websiteUrl && (
                              <a
                                href={item.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resources-tech-link primary"
                                title={`Visit ${item.name} website`}
                              >
                                <span>{item.visitLabel || 'Visit'}</span>
                                <ExternalLink size={11} aria-hidden="true" />
                              </a>
                            )}

                            {item.docsUrl && (
                              <a
                                href={item.docsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resources-tech-link"
                                title={`Open ${item.name} documentation`}
                              >
                                <BookOpen size={11} aria-hidden="true" />
                                <span>Docs</span>
                              </a>
                            )}

                            {item.githubUrl && (
                              <a
                                href={item.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resources-tech-link"
                                title={`Open ${item.name} on GitHub`}
                              >
                                <GitHubIcon width={12} height={12} aria-hidden="true" />
                                <span>GitHub</span>
                              </a>
                            )}
                          </footer>
                        </article>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* History Footer */}

    </article>
  );
}

export default ResourcesHistory;
