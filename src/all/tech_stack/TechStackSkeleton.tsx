import { Skeleton, SkeletonGroup } from '../ui';

export function TechStackMarqueeSkeleton() {
  return (
    <SkeletonGroup
      className="tech-tag-list"
      label="Loading technology stack tags"
    >
      {[0, 1, 2, 3, 4].map((rowIdx) => (
        <div key={`skeleton-row-${rowIdx}`} className="loop-slider" style={{ opacity: 0.65 }}>
          <div className="inner" style={{ animationDuration: '0s', gap: '22px' }}>
            {Array.from({ length: 12 }).map((_, itemIdx) => (
              <div key={itemIdx} className="tech-tag">
                <Skeleton variant="circular" width={16} height={16} />
                <Skeleton variant="text" width={60 + ((itemIdx * 17) % 40)} height={16} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

export function TechStackHistorySkeleton() {
  return (
    <SkeletonGroup label="Loading technology categories">
      <div
        className="tech-history-timeline"
        style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}
      >
        {[0, 1, 2, 3, 4].map((idx) => {
          const isReverse = idx % 2 !== 0;
          const containerClass = "tech-skills-marquee-container";
          const trackClass = "tech-skills-marquee-track" + (isReverse ? " reverse" : "");

          return (
            <div key={`history-skeleton-${idx}`} className="tech-list-item" style={{
              width: '100%',
              flexShrink: 0
            }}>
              <div className="tech-content">
                <div className="tech-role-block">
                  <div className={containerClass}>
                    <div className={trackClass} style={{ animationDuration: '0s' }}>
                      {Array.from({ length: 12 }).map((_, itemIdx) => (
                        <span
                          key={itemIdx}
                          className="tech-skill-pill"
                          style={{ opacity: 0.65 }}
                        >
                          <span className="tech-pill-icon" aria-hidden="true">
                            <Skeleton variant="circular" width={14} height={14} />
                          </span>
                          <Skeleton variant="text" width={60 + ((itemIdx * 17) % 40)} height={14} />
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
    </SkeletonGroup>
  );
}
