import { useMemo } from 'react';
import { ArrowLeft, ExternalLink, CheckCircle2, Award, RefreshCw } from 'lucide-react';
import { useSuspenseCertifications } from './queries';
import type { CertificationItem } from './types';
import { Skeleton, HistoryFooter, Spinner } from '../ui';
import Kinetic from '@/components/registry/kinetic/kinetic';
import './certification_history.css';

export interface CertificationHistoryProps {
  readonly username?: string;
  readonly token?: string;
  readonly onBack?: () => void;
  readonly subtitle?: string;
}

import { getInitials } from './fetchCertifications';

/**
 * Aurora Scharff Co-located Zero-CLS Certifications History Skeleton.
 */
export function CertificationHistorySkeleton() {
  return (
    <div className="cert-history-loading" role="status" aria-busy="true" aria-label="Loading certifications timeline">
      <span className="sr-only">Loading certifications timeline...</span>
      {[1, 2, 3].map((key, idx) => (
        <div key={key} className="cert-rail-item" aria-hidden="true" style={{ marginBottom: 24 }}>
          <div className="cert-logo-rail">
            <Skeleton variant="rounded" width={48} height={48} />
            {idx !== 2 && <div className="cert-rail-line" style={{ opacity: 0.3 }} />}
          </div>
          <div className="cert-rail-content" style={{ flex: 1 }}>
            <div className="cert-company-header" style={{ marginBottom: 8 }}>
              <Skeleton variant="text" width="40%" height={22} />
              <Skeleton variant="text" width="25%" height={14} />
            </div>
            <div className="cert-inner-rail">
              <div className="cert-role-block">
                <Skeleton variant="text" width="55%" height={16} />
                <Skeleton variant="text" width="80%" height={14} style={{ marginTop: 6 }} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CertificationHistory({
  username = 'joshuapalero',
  token,
  onBack,
  subtitle: propSubtitle,
}: CertificationHistoryProps) {
  const { data, isFetching, isError, refetch } = useSuspenseCertifications({ username, token });

  const items = useMemo<readonly CertificationItem[]>(() => data?.items ?? [], [data?.items]);
  const sourceUrl = data?.sourceUrl || `https://github.com/${username}/Certifications-`;
  const dynamicSubtitle = propSubtitle || data?.subtitle;

  return (
    <article className="cert-history-container" aria-label="Certifications & Credentials">
      {/* Back Button */}
      {onBack && (
        <button
          type="button"
          className="cert-history-back-btn"
          onClick={onBack}
          aria-label="Back to home"
        >
          <ArrowLeft size={16} />
          <span>Back to home</span>
        </button>
      )}

      {/* Page Header matching ExperienceHistory style with Kinetic animated subtitle */}
      <header className="cert-history-header">
        <div className="cert-history-header-top">
          <h1 className="cert-history-title">Certifications</h1>
          {isFetching && (
            <div className="cert-history-header-badges">
              <span className="cert-revalidating-badge" title="Syncing live updates from GitHub...">
                <Spinner size="sm" label="Syncing..." />
                <span>Syncing</span>
              </span>
            </div>
          )}
        </div>
        {dynamicSubtitle && (
          <div className="cert-history-subtitle">
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

      {/* Dual Vertical Rail Timeline */}
      <div className="cert-history-timeline" role="list">
        {isError || items.length === 0 ? (
          <div className="cert-history-empty-card">
            <div className="cert-history-empty-icon-wrapper">
              <Award size={28} />
            </div>
            <h2 className="cert-history-empty-title">Empty</h2>
            {isError && (
              <div style={{ marginTop: '12px' }}>
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
            const logoLetters = getInitials(item.issuer, item.title);
            const targetUrl = item.credentialUrl || sourceUrl;

            return (
              <div key={item.id} className="cert-rail-item" role="listitem">
                {/* Left Logo Rail */}
                <div className="cert-logo-rail">
                  <div className="cert-logo-box" aria-hidden="true">
                    {logoLetters}
                  </div>
                  {!isLast && <div className="cert-rail-line" aria-hidden="true" />}
                </div>

                {/* Right Content */}
                <div className="cert-rail-content">
                  <div className="cert-company-header">
                    <h2 className="cert-company-name">
                      {item.issuer}
                      {targetUrl && (
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="cert-repo-anchor"
                          title="View credential or source repository"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </h2>
                    <p className="cert-company-type">
                      {item.badge || 'Verified Credential'}
                      {item.credentialId ? ` · ID: ${item.credentialId}` : ''}
                    </p>
                  </div>

                  {/* Inner rail with second vertical line */}
                  <div className="cert-inner-rail">
                    <div className="cert-role-block">
                      {/* Circle node on inner vertical line */}
                      <span className="cert-inner-dot" aria-hidden="true" />

                      <div className="cert-role-title-row">
                        <h3 className="cert-role-title">{item.title}</h3>
                        {item.verified && (
                          <span className="cert-verified-badge" title="Verified Certification">
                            <CheckCircle2 size={12} />
                            <span>Verified</span>
                          </span>
                        )}
                      </div>

                      <p className="cert-duration-meta">
                        ISSUED: {item.issueDate.toUpperCase()}
                        {item.expiryDate ? ` · EXPIRES: ${item.expiryDate.toUpperCase()}` : ' · NO EXPIRATION'}
                      </p>

                      {/* Description */}
                      {item.description && (
                        <div className="cert-paragraphs">
                          <p>{item.description}</p>
                        </div>
                      )}

                      {/* Skill Pills */}
                      {item.skills && item.skills.length > 0 && (
                        <div className="cert-skills-group" aria-label="Credential skills">
                          {item.skills.map((skill) => (
                            <span key={skill} className="cert-skill-pill">
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

export default CertificationHistory;
