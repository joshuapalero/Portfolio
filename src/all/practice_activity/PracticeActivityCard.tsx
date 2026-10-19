import { Link } from '@tanstack/react-router';
import {
  GitBranch,
  Terminal,
  Container,
  ArrowRight,
} from 'lucide-react';
import { formatPracticeDate } from './formatDate';
import type { PracticeActivityItem } from './types';

export interface PracticeActivityCardProps {
  readonly item: PracticeActivityItem;
  readonly onSelect?: (item: PracticeActivityItem) => void;
}

function resolveTopicIcon(iconName: string) {
  switch (iconName.toLowerCase()) {
    case 'gitbranch':
    case 'git':
      return <GitBranch size={20} />;
    case 'container':
    case 'docker':
      return <Container size={20} />;
    case 'terminal':
    case 'cli':
    case 'shell':
    default:
      return <Terminal size={20} />;
  }
}

export function PracticeActivityCard({ item, onSelect }: PracticeActivityCardProps) {
  const handleClick = () => {
    onSelect?.(item);
  };

  const formattedDate = formatPracticeDate(item.lastUpdated);

  return (
    <Link
      to="/practice-activity/$slug"
      params={{ slug: item.slug }}
      className="practice-card"
      onClick={handleClick}
      aria-label={`${item.title} — ${item.categoryLabel}`}
    >
      <header className="practice-card-header">
        <div className="practice-card-icon-box" aria-hidden="true">
          {resolveTopicIcon(item.iconName)}
        </div>

        {formattedDate && (
          <time className="practice-card-date" dateTime={item.lastUpdated}>
            {formattedDate}
          </time>
        )}
      </header>

      <h3 className="practice-card-title">{item.title}</h3>
      {item.excerpt && <p className="practice-card-excerpt">{item.excerpt}</p>}

      <footer className="practice-card-footer">
        <span className="practice-card-action">
          <span>Explore Guide</span>
          <ArrowRight size={14} />
        </span>
      </footer>
    </Link>
  );
}

export default PracticeActivityCard;
