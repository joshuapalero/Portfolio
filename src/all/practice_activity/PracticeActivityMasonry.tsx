import { useMemo, useEffect, useState } from 'react';
import { ExternalLink, RefreshCw, ArrowLeft } from 'lucide-react';
import type { PracticeActivityItem } from './types';
import PracticeActivityCard from './PracticeActivityCard';
import PracticeActivitySkeleton from './PracticeActivitySkeleton';
import Kinetic from '../../components/registry/kinetic/kinetic';
import './practice_activity.css';

export interface PracticeActivityMasonryProps {
  readonly items?: readonly PracticeActivityItem[];
  readonly isPending?: boolean;
  readonly isFetching?: boolean;
  readonly isError?: boolean;
  readonly error?: Error | null;
  readonly onRetry?: () => void;
  readonly onBack?: () => void;
  readonly sourceUrl?: string;
  readonly isFallback?: boolean;
  readonly subtitle?: string;
}

/**
 * Responsive column count for natural masonry flow (aligned with Recommendations):
 * Desktop: 3 columns (Left, Middle, Right)
 * Tablet: 2 columns
 * Mobile: 1 column
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

export function PracticeActivityMasonry({
  items = [],
  isPending = false,
  isFetching = false,
  isError = false,
  error = null,
  onRetry,
  onBack,
  sourceUrl,
  isFallback = false,
  subtitle,
}: PracticeActivityMasonryProps) {
  const columnCount = useColumnCount();

  // 1-2-3 Left-to-Right Masonry Column Distribution
  const columns = useMemo(() => {
    const cols: PracticeActivityItem[][] = Array.from({ length: columnCount }, () => []);
    items.forEach((item, index) => {
      cols[index % columnCount].push(item);
    });
    return cols;
  }, [items, columnCount]);

  return (
    <div className="practice-page-container">
      {onBack && (
        <button
          type="button"
          className="practice-back-btn"
          onClick={onBack}
          aria-label="Return to portfolio home"
        >
          <ArrowLeft size={16} />
          <span>Back to Portfolio</span>
        </button>
      )}

      <header className="practice-header">
        <div className="practice-header-top">
          <div className="practice-title-group">
            <h1 className="practice-title">practice activity</h1>
            {isFetching && (
              <RefreshCw
                size={14}
                className="animate-spin"
                style={{ color: 'var(--text-muted)' }}
                aria-label="Synchronizing with GitHub..."
              />
            )}
          </div>

          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="practice-source-pill"
              title="View source repository on GitHub"
            >
              <span>{isFallback ? 'GitHub Repo: Practice-Activity-Repo' : 'View on GitHub'}</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        <div className="practice-subtitle">
          <Kinetic interval={60000} shadow={false} text={subtitle || 'Practical preparation and best practices for effective learning and skill-building.'} />
        </div>
      </header>

      {/* Content Rendering: Skeleton / Error / Masonry */}
      {isPending ? (
        <PracticeActivitySkeleton columnCount={columnCount} />
      ) : isError ? (
        <div className="practice-warning-box" role="alert" style={{ marginBottom: 24 }}>
          <span>Failed to load practice activities: {error?.message || 'Unknown error'}</span>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              style={{
                marginLeft: 'auto',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Retry
            </button>
          )}
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--text-secondary)',
            background: 'var(--bg-card)',
            borderRadius: 5,
            border: '1px solid var(--border-color)',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            No practice activities available at this time.
          </p>
        </div>
      ) : (
        <div className="practice-masonry" role="list">
          {columns.map((colItems, colIdx) => (
            <div key={colIdx} className="practice-col">
              {colItems.map((item) => (
                <PracticeActivityCard key={item.id} item={item} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PracticeActivityMasonry;
