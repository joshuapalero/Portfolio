import { useState, useMemo, type MouseEvent } from 'react';
import { ArrowRight, ExternalLink, Award, CheckCircle2, RefreshCw } from 'lucide-react';
import { useCertifications } from './queries';
import { Skeleton, SkeletonGroup, Spinner } from '../ui';
import Kinetic from '@/components/registry/kinetic/kinetic';
import './certification.css';

export interface CertificationProps {
  readonly sectionNumber?: string;
  readonly sectionTitle?: string;
  readonly subtitle?: string;
  readonly username?: string;
  readonly token?: string;
  readonly onViewAllCertifications?: () => void;
  readonly onBack?: () => void;
}

/**
 * Aurora Scharff Co-located Zero-CLS Certifications Skeleton Component.
 * Faithfully mirrors the 3-column table row layout and typography of the loaded list.
 */
export function CertificationSkeleton() {
  return (
    <SkeletonGroup label="Loading certifications..." className="cert-table">
      {[1, 2, 3].map((key) => (
        <div key={key} className="cert-row" aria-hidden="true" style={{ cursor: 'default' }}>
          <div className="cert-col-year">
            <Skeleton variant="text" width={42} height={14} />
          </div>
          <div className="cert-col-title">
            <Skeleton variant="text" width={160} height={14} />
          </div>
          <div className="cert-col-issuer">
            <Skeleton variant="text" width={110} height={14} />
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

export default function Certification({
  sectionNumber = '04',
  sectionTitle = 'Certifications',
  subtitle: propSubtitle,
  username = 'joshuapalero',
  token,
  onViewAllCertifications,
}: CertificationProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isPending, isFetching, isError, refetch } = useCertifications({ username, token });

  const items = useMemo(() => data?.items ?? [], [data?.items]);
  const sourceUrl = data?.sourceUrl || `https://github.com/${username}/Certifications-`;
  const dynamicSubtitle = propSubtitle || data?.subtitle;

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleAllClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onViewAllCertifications) {
      e.preventDefault();
      onViewAllCertifications();
    }
  };

  return (
    <section className="cert-section" aria-label="Certifications">
      {/* Header — mirrors Experience section: title-group (flex-col) + link */}
      <div className="cert-section-header">
        <div className="cert-title-group">
          <div className="cert-section-title-label">
            <span>{sectionNumber} —</span>{' '}
            <span className="cert-word">{sectionTitle}</span>
            {isFetching && !isPending && (
              <span className="cert-revalidating-wrapper" title="Synchronizing credentials...">
                <Spinner size="sm" label="Syncing certification data" className="cert-revalidating-spinner" />
              </span>
            )}
          </div>
          {isPending && !propSubtitle ? (
            <div className="cert-subtitle-skeleton" aria-hidden="true">
              <Skeleton variant="text" width={220} height={14} />
            </div>
          ) : dynamicSubtitle ? (
            <div className="cert-subtitle">
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
          href={onViewAllCertifications ? '/certifications' : sourceUrl}
          onClick={handleAllClick}
          className="cert-history-link"
          title="View all certifications & credentials"
        >
          <span>see list</span>
          <ArrowRight size={14} className="cert-arrow" />
        </a>
      </div>

      {/* Bryl Lim Minimalist Certification Table */}
      <div className="cert-table">
        {isPending ? (
          <CertificationSkeleton />
        ) : isError || items.length === 0 ? (
          <div className="cert-empty-container">
            <div className="cert-empty-box">
              <Award size={20} className="cert-empty-icon" />
              <div className="cert-empty-content">
                <span className="cert-empty-title">Empty</span>
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
              <div key={item.id} className="cert-row-container">
                <div
                  className={`cert-row ${isExpanded ? 'active' : ''}`}
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
                  <div className="cert-col-year">{item.year}</div>
                  <div className="cert-col-title">
                    <span>{item.title}</span>
                    {item.verified && (
                      <span title="Verified Credential" className="cert-verified-inline-wrapper">
                        <CheckCircle2 size={13} className="cert-verified-inline-icon" />
                      </span>
                    )}
                  </div>
                  <div className="cert-col-issuer">{item.issuer}</div>
                </div>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div className="cert-expanded-body">
                    {item.badge && (
                      <div className="cert-tag-line">
                        <Award size={12} className="cert-tag-icon" />
                        <span>{item.badge}</span>
                      </div>
                    )}

                    <div className="cert-meta-line">
                      <span className="cert-period">Issued: {item.issueDate}</span>
                      {item.credentialId && (
                        <>
                          <span className="cert-meta-sep">•</span>
                          <span className="cert-cred-id">ID: {item.credentialId}</span>
                        </>
                      )}
                      {item.credentialUrl && (
                        <>
                          <span className="cert-meta-sep">•</span>
                          <a
                            href={item.credentialUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="cert-repo-link"
                            title="Verify credential on GitHub or provider"
                          >
                            <span>Credential / Repo</span>
                            <ExternalLink size={11} />
                          </a>
                        </>
                      )}
                    </div>

                    {item.description && (
                      <p className="cert-expanded-desc">{item.description}</p>
                    )}

                    {item.skills && item.skills.length > 0 && (
                      <div className="cert-skills-line" aria-label="Certified skills">
                        {item.skills.map((skill) => (
                          <span key={skill} className="cert-skill-badge">
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
