import { useState, useMemo, type CSSProperties, type MouseEvent } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import type { TechStackProps } from './types';
import { useTechStack } from './queries';
import { TechStackMarqueeSkeleton } from './TechStackSkeleton';
import './tech_stack.css';

export default function TechStack({
  sectionNumber = '05',
  sectionTitle = 'Technology Stack',
  onViewAllTech,
  username,
}: TechStackProps) {
  const [showLogos, setShowLogos] = useState<boolean>(true);
  const resolvedUsername =
    username ||
    (typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_GITHUB_USERNAME as string | undefined)
      : undefined) ||
    'joshuapalero';

  const { data, isPending } = useTechStack({ username: resolvedUsername });

  const handleHistoryClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onViewAllTech) {
      e.preventDefault();
      onViewAllTech();
    }
  };

  const rows = useMemo(() => data?.rows ?? [], [data?.rows]);

  return (
    <section className="tech-stack-section" aria-label="Technology Stack">
      <header className="tech-stack-header">
        <div className="tech-stack-title-label">
          <span>{sectionNumber} —</span>
          <span className="tech-stack-word">{sectionTitle}</span>
        </div>

        <div className="tech-stack-controls">
          <button
            type="button"
            className={`tech-toggle-icon-btn ${showLogos ? 'active' : ''}`}
            onClick={() => setShowLogos((prev) => !prev)}
            title={showLogos ? 'Hide logos' : 'Show logos'}
            aria-label="Toggle technology logos"
          >
            <ImageIcon size={15} />
          </button>

          <a
            href="/tech-stack"
            onClick={handleHistoryClick}
            className="tech-stack-history-link"
            title="View full technology stack"
          >
            <span>see stack</span>
            <span className="history-arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </header>

      {isPending && !data ? (
        <TechStackMarqueeSkeleton />
      ) : rows.length === 0 ? (
        <TechStackMarqueeSkeleton />
      ) : (
        <div className="tech-tag-list">
          <div className="tech-fade-left" aria-hidden="true" />
          <div className="tech-fade-right" aria-hidden="true" />

          {rows.map((row, rowIndex) => {
            const rowStyle: CSSProperties = {
              ['--duration' as string]: `${row.duration}ms`,
              ['--direction' as string]: row.reverse ? 'reverse' : 'normal',
            };

            // Duplicate items once to create seamless gapless infinite loop
            const duplicatedItems = [...row.items, ...row.items];

            return (
              <div
                key={`slider-row-${rowIndex}`}
                className="loop-slider"
                style={rowStyle}
                role="region"
                aria-label={`Technology tags row ${rowIndex + 1}`}
              >
                <div className="inner">
                  {duplicatedItems.map((item, itemIndex) => (
                    <div
                      key={`${item.name}-${rowIndex}-${itemIndex}`}
                      className="tech-tag"
                      title={item.role ? `${item.name} — ${item.role}` : item.name}
                    >
                      {showLogos && item.iconSvg && (
                        <span className="tech-tag-icon" aria-hidden="true">
                          {item.iconSvg}
                        </span>
                      )}
                      {showLogos && !item.iconSvg && item.iconSrc && (
                        <span className="tech-tag-icon" aria-hidden="true">
                          <img src={item.iconSrc} alt="" width={16} height={16} decoding="async" />
                        </span>
                      )}
                      <span className="tech-tag-name">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export { TechStack };
