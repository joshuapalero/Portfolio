import { ArrowLeft } from 'lucide-react';
import type { TechStackHistoryProps } from './types';
import { useSuspenseTechStack } from './queries';
import { TechStackHistorySkeleton } from './TechStackSkeleton';
import { HistoryFooter } from '../ui';
import './tech_stack_history.css';

export function TechStackHistory({ onBack, username }: TechStackHistoryProps) {
  const resolvedUsername =
    username ||
    (typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_GITHUB_USERNAME as string | undefined)
      : undefined) ||
    'joshuapalero';

  const { data, } = useSuspenseTechStack({ username: resolvedUsername });

  const groups = data?.groups ?? [];
  const externalUrl = data?.sourceUrl || `https://github.com/${resolvedUsername}/Technologies`;

  const formattedDate = data?.lastUpdated
    ? `UPDATED ${new Date(data.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}`
    : 'UPDATED SEP 23, 2026';

  return (
    <article className="tech-history-container" aria-label="Full Technology Stack">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        {/* Back Button */}
        {onBack ? (
          <button
            type="button"
            className="tech-history-back-btn"
            style={{ marginBottom: 0 }}
            onClick={onBack}
            aria-label="Back to home"
          >
            <ArrowLeft size={16} />
            <span>Back to home</span>
          </button>
        ) : <div />}


        <div style={{ fontSize: '11px', color: '#9ca3af', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
          {formattedDate}
        </div>
      </div>

      <div className="tech-history-h2" style={{ marginTop: '16px', marginBottom: '40px' }}>
        <h2>technology stack</h2>
      </div>


      {/* ── DUAL VERTICAL RAIL TIMELINE (Matches ExperienceHistory) ── */}
      {!data ? (
        <TechStackHistorySkeleton />
      ) : groups.length === 0 ? (
        <div className="tech-empty-state" style={{ padding: '32px 0', color: 'var(--text-muted)' }}>
          <p>No technologies published yet. Push a README.md to {externalUrl} to populate this timeline.</p>
        </div>
      ) : (
        <div className="tech-history-timeline" role="list" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          {groups.map((group, index) => {
            const isReverse = index % 2 !== 0;
            const containerClass = "tech-skills-marquee-container";
            const trackClass = "tech-skills-marquee-track" + (isReverse ? " reverse" : "");

            return (
              <div key={group.id} className="tech-list-item" role="listitem" style={{
                width: '100%',
                flexShrink: 0
              }}>
                <div className="tech-content">
                  <div className="tech-role-block">
                    <div className={containerClass} aria-label={`Technologies in ${group.title}`}>
                      <div className={trackClass}>
                        {[...group.items, ...group.items, ...group.items, ...group.items].map((item, idx) => (
                          <span
                            key={`${group.id}-${item.name}-${idx}`}
                            className="tech-skill-pill"
                            title={`${item.name} — ${item.role ?? item.category ?? ''}`}
                          >
                            {item.iconSvg && (
                              <span className="tech-pill-icon" aria-hidden="true">
                                {item.iconSvg}
                              </span>
                            )}
                            {!item.iconSvg && item.iconSrc && (
                              <span className="tech-pill-icon" aria-hidden="true">
                                <img src={item.iconSrc} alt="" width={16} height={16} decoding="async" />
                              </span>
                            )}
                            <span>{item.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <HistoryFooter
        externalUrl={externalUrl}
        externalText="View on GitHub"
      />
    </article>
  );
}

export default TechStackHistory;
