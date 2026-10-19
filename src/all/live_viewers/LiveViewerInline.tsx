import { Eye } from 'lucide-react';
import { useLiveViewers } from './useLiveViewers';
import { getAvatarDataUri } from './avatars';
import { Skeleton } from '../ui';
import './live_viewers_inline.css';

/**
 * Live Viewers & Presence Widget:
 * 1. Stacked hand-drawn sketch avatars with `+N` overflow & Live indicator
 * 2. Authentic live count ("X people viewing now")
 * 3. Dynamic total portfolio visits counter ("Y visits")
 *
 * Implements TanStack Query v5 best practices (Aurora Scharff declarative pattern).
 */
export default function LiveViewerInline() {
  const { count, totalVisits, currentViewer, isPending, isError } = useLiveViewers();

  // ── Pending: show a lightweight skeleton pill instead of synthetic count=1 data ──
  if (isPending) {
    return (
      <div
        className="live-viewers-widget"
        role="status"
        aria-label="Loading presence and visitor stats"
      >
        <Skeleton variant="rounded" width={110} height={22} animation="pulse" />
      </div>
    );
  }

  // ── Error: silent fallback — widget is decorative, not critical ───────────
  if (isError) return null;

  // Maximum visible avatars before showing the +N counter
  const maxAvatars = 3;
  // Real, authentic human presence ("no cap")
  const displayCount = Math.max(1, count);
  const displayTotalVisits = Math.max(1, totalVisits || 1);
  const visibleCount = Math.min(displayCount, maxAvatars);
  const overflowCount = Math.max(0, displayCount - maxAvatars);

  const viewerLabel = displayCount === 1 ? 'person viewing now' : 'people viewing now';
  const locationText = currentViewer.city
    ? `${currentViewer.city}, ${currentViewer.country}`
    : currentViewer.country || 'Worldwide';

  return (
    <div
      className="live-viewers-widget"
      role="status"
      aria-live="polite"
      title={`Live Presence: ${displayCount} online (${locationText}) · Total Visits: ${displayTotalVisits.toLocaleString()}`}
    >
      {/* ── 1. Overlapping Sketch Avatars Row ───────────────────────────────── */}
      <div className="live-avatar-row">
        <div className="live-avatar-stack" aria-hidden="true">
          {Array.from({ length: visibleCount }).map((_, index) => (
            <div
              key={index}
              className="live-avatar-item"
              style={{ zIndex: maxAvatars - index }}
            >
              <img
                src={getAvatarDataUri(index)}
                alt=""
                className="live-avatar-img"
                loading="eager"
              />
            </div>
          ))}

          {overflowCount > 0 && (
            <div className="live-avatar-item live-avatar-overflow" style={{ zIndex: 0 }}>
              <span>+{overflowCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. "X people viewing now" ─────────────────────────────────────── */}
      <div className="live-viewers-count-line">
        <strong className="live-viewers-count-num">{displayCount}</strong>
        <span className="live-viewers-count-text">{viewerLabel}</span>
      </div>

      {/* ── 3. Total Portfolio Visits (Dynamic Count) ─────────────────────── */}
      <div className="live-total-visits-line">
        <Eye size={12} className="live-visits-icon" aria-hidden="true" />
        <span className="live-visits-count">
          <strong>{displayTotalVisits.toLocaleString()}</strong> visits
        </span>
      </div>
    </div>
  );
}
