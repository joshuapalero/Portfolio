import { Skeleton, SkeletonGroup } from '../ui';

export interface PracticeActivitySkeletonProps {
  readonly columnCount?: number;
}

/**
 * Aurora Scharff Co-located Zero-CLS Masonry Skeletons for Practice Activity.
 * Mirrors the exact DOM structure, margins, and padding of PracticeActivityCard
 * to ensure 100% layout parity and zero content overflow.
 */
export function PracticeActivitySkeleton({ columnCount = 3 }: PracticeActivitySkeletonProps) {
  return (
    <SkeletonGroup
      label="Loading practice activities from GitHub..."
      className="practice-masonry"
    >
      {Array.from({ length: columnCount }).map((_, colIdx) => (
        <div key={colIdx} className="practice-col">
          {[1, 2].map((cardIdx) => (
            <div
              key={cardIdx}
              className="practice-card practice-skeleton-card"
              aria-hidden="true"
            >
              <header className="practice-card-header">
                <Skeleton variant="rounded" width={40} height={40} />
                <Skeleton variant="text" width={84} height={16} />
              </header>

              <div style={{ marginBottom: 8 }}>
                <Skeleton variant="text" width="75%" height={24} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                <Skeleton variant="text" width="100%" height={14} />
                <Skeleton variant="text" width="94%" height={14} />
                <Skeleton variant="text" width="65%" height={14} />
              </div>

              <footer className="practice-card-footer">
                <Skeleton variant="rounded" width={96} height={20} />
              </footer>
            </div>
          ))}
        </div>
      ))}
    </SkeletonGroup>
  );
}

export default PracticeActivitySkeleton;
