import { useTransition, useOptimistic } from 'react';
import { ThumbsUp } from 'lucide-react';
import { useSectionLikes } from './useSectionLikes';
import { REACTION_ITEMS, type ReactionType } from './types';
import './section_reactions.css';

export interface SectionReactionsProps {
  readonly sectionId?: string;
  readonly className?: string;
}

function ReactionIcon({ isActive }: { type: ReactionType; isActive: boolean }) {
  return (
    <ThumbsUp
      size={14}
      className="reaction-icon"
      fill={isActive ? 'currentColor' : 'none'}
      strokeWidth={1.8}
      aria-hidden="true"
    />
  );
}

/**
 * Clean Black & White / Monochrome Reactions bar:
 * Powered by TanStack Query v5 cache + React 19 useOptimistic & useTransition.
 */
export function SectionReactions({
  sectionId = 'profile',
  className = '',
}: SectionReactionsProps) {
  const { count, userLiked, toggleLike, isPending: isMutationPending } = useSectionLikes(sectionId);
  const [isTransitionPending, startTransition] = useTransition();

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
    <div
      className={`section-reactions-bar ${className}`.trim()}
      role="group"
      aria-label="Reactions"
    >
      {REACTION_ITEMS.map((item) => {
        const isActive = optimisticState.userLiked;
        const displayCount = optimisticState.count;

        return (
          <button
            key={item.type}
            type="button"
            className={`reaction-btn ${isActive ? 'is-active' : ''}`}
            onClick={handleToggle}
            aria-label={`${item.label}: ${displayCount} reactions`}
            aria-pressed={isActive}
            aria-busy={isPending}
            title={`${item.label} (${displayCount})`}
          >
            <ReactionIcon type={item.type} isActive={isActive} />
            <span className="reaction-count">{displayCount}</span>
          </button>
        );
      })}
    </div>
  );
}

export default SectionReactions;
