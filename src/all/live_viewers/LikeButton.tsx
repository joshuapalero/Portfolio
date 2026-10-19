import { useTransition, useOptimistic } from 'react';
import { ThumbsUp } from 'lucide-react';
import { useSectionLikes } from './useSectionLikes';

export interface LikeButtonProps {
  readonly sectionId?: string;
  readonly className?: string;
}

function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * LikeButton adhering to React 19.2 concurrent primitives & Aurora Scharff patterns:
 * - useOptimistic for immediate 0ms visual toggle feedback
 * - useTransition for coordinated, non-blocking concurrent rendering
 * - TanStack Query v5 cache synchronization & multi-tab BroadcastChannel
 */
export function LikeButton({ sectionId = 'profile', className = '' }: LikeButtonProps) {
  const { count, userLiked, toggleLike, isPending: isMutationPending } = useSectionLikes(sectionId);
  const [isTransitionPending, startTransition] = useTransition();

  // React 19 useOptimistic hook for instantaneous visual toggle
  const [optimisticState, setOptimisticState] = useOptimistic(
    { count, userLiked },
    (current, action: 'like' | 'unlike') => ({
      count: action === 'like' ? current.count + 1 : Math.max(0, current.count - 1),
      userLiked: action === 'like',
    }),
  );

  const handleToggle = () => {
    const nextAction = optimisticState.userLiked ? 'unlike' : 'like';
    startTransition(() => {
      setOptimisticState(nextAction);
      toggleLike();
    });
  };

  const isPending = isTransitionPending || isMutationPending;

  return (
    <button
      type="button"
      className={`like-btn ${optimisticState.userLiked ? 'is-active' : ''} ${className}`.trim()}
      onClick={handleToggle}
      aria-label={`Like portfolio (${optimisticState.count} likes)`}
      aria-pressed={optimisticState.userLiked}
      aria-busy={isPending}
      title={optimisticState.userLiked ? 'Unlike' : 'Like'}
    >
      <ThumbsUp
        size={18}
        fill={optimisticState.userLiked ? 'currentColor' : 'none'}
        strokeWidth={1.75}
        className="like-icon"
      />
      <span className="like-count">{formatCompactNumber(optimisticState.count)}</span>
    </button>
  );
}

export default LikeButton;
