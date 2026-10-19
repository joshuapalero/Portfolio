import { useMemo } from 'react';
import { ArrowLeft, ExternalLink, Briefcase, RefreshCw } from 'lucide-react';
import { useSuspenseExperience } from './queries';
import { getCompanyInitials, calculateDurationMeta, formatWorkType } from './gist';
import { Skeleton, SkeletonGroup, Spinner, HistoryFooter } from '../ui';
import Kinetic from '@/components/registry/kinetic/kinetic';
import { MarqueeText } from '@/components/registry/marquee-text/marquee-text';
import './experience_history.css';

export interface ExperienceHistoryProps {
  readonly username?: string;
  readonly gistId?: string;
  readonly token?: string;
  readonly onBack?: () => void;
  readonly subtitle?: string;
}

/**
 * Aurora Scharff Co-located Zero-CLS Timeline Skeleton.
 * Accurately replicates the double-rail timeline layout, company logo rail,
 * role titles, duration meta, paragraph text blocks, and skill pills.
 */
export function ExperienceHistorySkeleton() {
  return (
    <SkeletonGroup
      label="Loading professional career timeline"
      className="exp-history-timeline exp-history-loading-group"
    >
      {[1, 2, 3].map((key, idx) => (
        <div key={key} className="exp-rail-item" aria-hidden="true" style={{ marginBottom: 28 }}>
          {/* Left Logo Rail */}
          <div className="exp-logo-rail">
            <Skeleton variant="rounded" width={48} height={48} />
            {idx !== 2 && <div className="exp-rail-line" style={{ opacity: 0.35 }} />}
          </div>

          {/* Right Content */}
          <div className="exp-rail-content" style={{ flex: 1 }}>
            <div className="exp-company-header" style={{ marginBottom: 12 }}>
              <Skeleton variant="text" width="45%" height={22} />
              <Skeleton variant="text" width="28%" height={14} style={{ marginTop: 4 }} />
            </div>

            <div className="exp-inner-rail">
              <div className="exp-role-block">
                <span className="exp-inner-dot" aria-hidden="true" style={{ opacity: 0.5 }} />
                <Skeleton variant="text" width="50%" height={18} />
                <Skeleton variant="text" width="35%" height={13} style={{ margin: '4px 0 8px 0' }} />

                <div className="exp-paragraphs" style={{ marginTop: 6, gap: 8 }}>
                  <Skeleton variant="text" width="100%" height={14} />
                  <Skeleton variant="text" width="94%" height={14} />
                  <Skeleton variant="text" width="82%" height={14} />
                </div>

                <div className="exp-skills-group" style={{ marginTop: 14 }}>
                  <Skeleton variant="rounded" width={56} height={24} />
                  <Skeleton variant="rounded" width={78} height={24} />
                  <Skeleton variant="rounded" width={64} height={24} />
                  <Skeleton variant="rounded" width={88} height={24} />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

export function ExperienceHistory({
  username = 'joshuapalero',
  gistId,
  token,
  onBack,
  subtitle: propSubtitle,
}: ExperienceHistoryProps) {
  const { data,  isFetching, isError, refetch } = useSuspenseExperience({ username, gistId, token });

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const sourceUrl = data?.sourceUrl || `https://github.com/${username}/Experience`;

  const dynamicSubtitle =
    propSubtitle ||
    data?.subtitle ||
    'professional software development experiences.';

  return (
    <article className="exp-history-container" aria-label="Full Experience History">
      {/* Back Button */}
      {onBack && (
        <button
          type="button"
          className="exp-history-back-btn"
          onClick={onBack}
          aria-label="Back to home"
        >
          <ArrowLeft size={16} />
          <span>Back to home</span>
        </button>
      )}

      {/* Page Header */}
      <header className="exp-history-header">
        <div className="exp-history-header-top">
          <h1 className="exp-history-title">experience</h1>
          {isFetching && (
            <div className="exp-history-header-badges">
              <span className="exp-revalidating-badge" title="Syncing live updates from GitHub...">
                <Spinner size="sm" label="Syncing..." />
                <span>Syncing</span>
              </span>
            </div>
          )}
        </div>
        {!propSubtitle ? (
          <div className="exp-history-subtitle-skeleton" aria-hidden="true" style={{ maxWidth: 420, margin: '6px 0 0 0' }}>
            <Skeleton variant="text" width="60%" height={16} />
          </div>
        ) : (
          <div className="exp-history-subtitle">
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
        )}
      </header>

      {/* Timeline List / Skeletons / Error / Empty States */}
      <div className="exp-history-timeline" role="list">
        {isError || items.length === 0 ? (
          <div className="exp-history-empty-card">
            <div className="exp-history-empty-icon-wrapper">
              <Briefcase size={28} />
            </div>
            <h2 className="exp-history-empty-title">Empty</h2>
            {isError && (
              <div className="exp-history-error-actions" style={{ marginTop: '12px' }}>
                <button
                  type="button"
                  className="exp-history-retry-btn"
                  onClick={() => void refetch()}
                >
                  <RefreshCw size={13} />
                  <span>Retry</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          items.map((item, index) => {
            const isLast = index === items.length - 1;
            const logoLetters = getCompanyInitials(item.company);
            const workType = formatWorkType(item);
            const durationMeta = calculateDurationMeta(item.period);

            return (
              <div key={item.id} className="exp-rail-item">
                {/* Left Logo Rail */}
                <div className="exp-logo-rail">
                  <div className="exp-logo-box" aria-hidden="true">
                    {logoLetters}
                  </div>
                  {!isLast && <div className="exp-rail-line" aria-hidden="true" />}
                </div>

                {/* Right Content */}
                <div className="exp-rail-content">
                  <div className="exp-company-header">
                    <h2 className="exp-company-name">
                      {item.company}
                      {item.companyUrl && (
                        <a
                          href={item.companyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="exp-repo-anchor"
                          title="View Repository"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </h2>
                    <div className="exp-company-type-wrapper">
                      <MarqueeText className="exp-company-type" text={workType} alwaysScroll={true} gap={32} />
                    </div>
                  </div>

                  {/* Inner container with the SECOND vertical line */}
                  <div className="exp-inner-rail">
                    <div className="exp-role-block">
                      {/* Circle node on the inner vertical line */}
                      <span className="exp-inner-dot" aria-hidden="true" />

                      <h3 className="exp-role-title">{item.role}</h3>
                      <p className="exp-duration-meta">{durationMeta}</p>

                      {/* Exact Paragraphs from Experience repo README */}
                      <div className="exp-paragraphs">
                        {item.achievements.map((paragraph, i) => (
                          <p key={i}>{paragraph}</p>
                        ))}
                      </div>

                      {/* Skill Pills */}
                      {item.skills && item.skills.length > 0 && (
                        <div className="exp-skills-group" aria-label="Technologies used">
                          {item.skills.map((skill) => (
                            <span key={skill} className="exp-skill-pill">
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <HistoryFooter
        externalUrl={sourceUrl}
        externalText="View on GitHub"
      />
    </article>
  );
}

export default ExperienceHistory;
