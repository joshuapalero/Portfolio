import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { ArrowUpRight } from 'lucide-react';
import { getSocialLinks, DEFAULT_RESUME_URL } from './social_data';
import { copyToClipboard } from './contactConfig';

export interface SocialLinksListProps {
  readonly variant?: 'compact' | 'full';
  readonly onItemClick?: () => void;
  readonly className?: string;
  readonly username?: string;
  readonly resumeUrl?: string;
  readonly email?: string;
  readonly showDescription?: boolean;
}

export default function SocialLinksList({
  variant = 'full',
  onItemClick,
  className = '',
  username = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_GITHUB_USERNAME || 'joshuapalero' : 'joshuapalero',
  resumeUrl = DEFAULT_RESUME_URL,
  email,
  showDescription = false,
}: SocialLinksListProps) {
  const activeResumeUrl = resumeUrl ?? DEFAULT_RESUME_URL;
  const items = useMemo(() => getSocialLinks(username, activeResumeUrl), [username, activeResumeUrl]);

  const handleLinkClick = async (isMailto: boolean) => {
    if (isMailto && email) {
      await copyToClipboard(email);
    }
    onItemClick?.();
  };

  if (variant === 'compact') {
    return (
      <div className={`nav-social-compact ${className}`.trim()} role="list" aria-label="Social links">
        {items.map((item) => {
          const isMailto = item.href.startsWith('mailto:');
          const content = (
            <>
              {item.icon}
              <span className="nav-tooltip" role="tooltip">{item.label}</span>
            </>
          );

          if (item.isInternal) {
            return (
              <Link
                key={item.id}
                to={item.href}
                className="nav-social-icon-btn"
                onClick={onItemClick}
                aria-label={item.label}
                title={item.label}
              >
                {content}
              </Link>
            );
          }

          return (
            <a
              key={item.id}
              href={item.href}
              target={isMailto ? undefined : '_blank'}
              rel={isMailto ? undefined : 'noopener noreferrer'}
              className="nav-social-icon-btn"
              onClick={() => handleLinkClick(isMailto)}
              aria-label={item.label}
              title={isMailto ? `${item.label} (clicks to open & copies address)` : item.label}
            >
              {content}
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <ul className={`nav-social-full ${className}`.trim()} aria-label="Social links directory">
      {items.map((item) => {
        const isMailto = item.href.startsWith('mailto:');

        return (
          <li key={item.id} className="nav-social-item">
            {item.isInternal ? (
              <Link
                to={item.href}
                className="nav-social-card-link"
                onClick={onItemClick}
                aria-label={`${item.label} (${item.handle})`}
              >
                <div className="nav-social-card-icon-wrap">
                  {item.icon}
                </div>
                <div className="nav-social-card-text">
                  <span className="nav-social-card-label">{item.label}</span>
                  <ArrowUpRight size={13} className="nav-social-card-arrow" aria-hidden="true" />
                </div>
                {showDescription && item.description && (
                  <span className="nav-social-card-desc">{item.description}</span>
                )}
              </Link>
            ) : (
              <a
                href={item.href}
                target={isMailto ? undefined : '_blank'}
                rel={isMailto ? undefined : 'noopener noreferrer'}
                className="nav-social-card-link"
                onClick={() => handleLinkClick(isMailto)}
                aria-label={isMailto ? `${item.label} (${item.handle}) - clicks to open and copies address` : `${item.label} (${item.handle})`}
              >
                <div className="nav-social-card-icon-wrap">
                  {item.icon}
                </div>
                <div className="nav-social-card-text">
                  <span className="nav-social-card-label">{item.label}</span>
                  <ArrowUpRight size={13} className="nav-social-card-arrow" aria-hidden="true" />
                </div>
                {showDescription && item.description && (
                  <span className="nav-social-card-desc">{item.description}</span>
                )}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
