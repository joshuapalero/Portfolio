import { useState, useMemo, type MouseEvent } from 'react';
import { ArrowRight, ExternalLink, Briefcase, RefreshCw } from 'lucide-react';
import { useExperience } from './queries';
import { Skeleton, SkeletonGroup, Spinner } from '../ui';
import Kinetic from '@/components/registry/kinetic/kinetic';
import './experience.css';

export interface ExperienceProps {
  readonly sectionNumber?: string;
  readonly sectionTitle?: string;
  readonly username?: string;
  readonly gistId?: string;
  readonly token?: string;
  readonly onViewHistory?: () => void;
  readonly subtitle?: string;
}

/**
 * Aurora Scharff Co-located Zero-CLS Skeleton Component.
 * Faithfully mirrors the 12-column grid layout, paddings, and typography of the loaded table.
 */
export function ExperienceSkeleton() {
  return (
    <SkeletonGroup
      label="Loading professional experience"
      className="experience-loading-group"
    >
      {[1, 2, 3].map((key) => (
        <div key={key} className="experience-row-container" aria-hidden="true">
          <div className="experience-row experience-row--skeleton" style={{ cursor: 'default' }}>
            <div className="experience-col-year">
              <Skeleton variant="text" width={42} height={14} />
            </div>
            <div className="experience-col-role">
              <Skeleton variant="text" width="60%" height={14} />
            </div>
            <div className="experience-col-company">
              <Skeleton variant="text" width={110} height={14} className="experience-skeleton-company-text" />
            </div>
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

export default function Experience({
  sectionNumber = '03',
  sectionTitle = 'Experience',
  username = 'joshuapalero',
  gistId,
  token,
  onViewHistory,
  subtitle: propSubtitle,
}: ExperienceProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isPending, isFetching, isError, refetch } = useExperience({ username, gistId, token });

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const historyUrl = data?.sourceUrl || `https://github.com/${username}/Experience`;
  const dynamicSubtitle = propSubtitle || data?.subtitle;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleHistoryClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onViewHistory) {
      e.preventDefault();
      onViewHistory();
    }
  };

  return (
    <section className="experience-section" aria-label="Experience">
      {/* Header matching Bryl Lim style with subtle non-disruptive sync spinner */}
      <div className="experience-header">
        <div className="experience-title-group">
          <div className="experience-title-label">
            <span>{sectionNumber} —</span>{' '}
            <span className="experience-word">{sectionTitle}</span>
            {isFetching && !isPending && (
              <span className="experience-revalidating-wrapper" title="Synchronizing live from GitHub...">
                <Spinner size="sm" label="Syncing experience data" className="experience-revalidating-spinner" />
              </span>
            )}
          </div>
          {isPending && !propSubtitle ? (
            <div className="experience-subtitle-skeleton" aria-hidden="true">
              <Skeleton variant="text" width={220} height={14} />
            </div>
          ) : dynamicSubtitle ? (
            <div className="experience-subtitle">
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
          href={onViewHistory ? '/experience' : historyUrl}
          onClick={handleHistoryClick}
          className="experience-history-link"
          title="View full experience history"
        >
          <span>see history</span>
          <ArrowRight size={14} className="history-arrow" />
        </a>
      </div>

      {/* Bryl Lim Minimalist Experience Table */}
      <div className="experience-table">
        {isPending ? (
          <ExperienceSkeleton />
        ) : isError || items.length === 0 ? (
          <div className="experience-empty-container">
            <div className="experience-empty-box">
              <Briefcase size={20} className="experience-empty-icon" />
              <div className="experience-empty-content">
                <span className="experience-empty-title">Empty</span>
                {isError && (
                  <button
                    type="button"
                    className="experience-retry-btn"
                    onClick={() => void refetch()}
                    style={{ marginTop: '4px' }}
                  >
                    <RefreshCw size={12} />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          items.map((item) => {
            const isExpanded = expandedId === item.id;

            return (
              <div key={item.id} className="experience-row-container">
                <div
                  className={`experience-row ${isExpanded ? 'active' : ''}`}
                  onClick={() => toggleExpand(item.id)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(item.id);
                    }
                  }}
                >
                  <div className="experience-col-year">{item.year}</div>
                  <div className="experience-col-role">{item.role}</div>
                  <div className="experience-col-company">{item.company}</div>
                </div>

                {/* 100% Exact Documentation from joshuapalero/Experience */}
                {isExpanded && (
                  <div className="experience-expanded-body">
                    {item.tag && (
                      <div className="experience-tag-line">{item.tag}</div>
                    )}

                    <div className="experience-meta-line">
                      <span className="experience-period">{item.period}</span>
                      {item.location && (
                        <>
                          <span className="meta-sep">•</span>
                          <span className="experience-location">{item.location}</span>
                        </>
                      )}
                      {item.companyUrl && (
                        <>
                          <span className="meta-sep">•</span>
                          <a
                            href={item.companyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="experience-repo-link"
                          >
                            <span>Repo</span>
                            <ExternalLink size={11} />
                          </a>
                        </>
                      )}
                    </div>

                    {item.project && (
                      <div className="experience-project-title">
                        {item.project}
                      </div>
                    )}

                    {item.achievements && item.achievements.length > 0 && (
                      <ul className="experience-text-list">
                        {item.achievements.map((ach, i) => (
                          <li key={i}>{ach}</li>
                        ))}
                      </ul>
                    )}

                    {item.skills && item.skills.length > 0 && (
                      <div className="experience-skills-line" aria-label="Technologies">
                        {item.skills.map((skill) => (
                          <span key={skill} className="experience-skill-badge">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
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
