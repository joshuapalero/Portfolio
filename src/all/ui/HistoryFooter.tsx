import type { FC, SVGProps } from 'react';
import { Link } from '@tanstack/react-router';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export const GitHubIcon: FC<IconProps> = ({ size = 15, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const FacebookIcon: FC<IconProps> = ({ size = 15, className = '', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export interface HistoryFooterProps {
  readonly externalUrl?: string;
  readonly externalText?: string;
  readonly platform?: 'github' | 'facebook';
  /**
   * @deprecated Back button removed from bottom footer per user request.
   */
  readonly onBack?: () => void;
  readonly backText?: string;
}

/**
 * Section History Footer:
 * - Full-width horizontal divider line (border-top)
 * - Platform repository/external link on the right with actual GitHub or Facebook icon
 * - Bottom "Back to home" removed per user request
 */
export function HistoryFooter({
  externalUrl,
  externalText = 'View on GitHub',
  platform,
}: HistoryFooterProps) {
  if (!externalUrl) return null;

  const isFacebook =
    platform === 'facebook' ||
    externalUrl.toLowerCase().includes('facebook.com') ||
    externalText.toLowerCase().includes('facebook');

  return (
    <footer className="section-history-footer">
      {isFacebook ? (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="section-footer-ext-link"
          aria-label={externalText}
        >
          <FacebookIcon size={15} className="section-footer-platform-icon" />
          <span>{externalText}</span>
        </a>
      ) : externalUrl.startsWith('/') ? (
        <div
          className="section-footer-ext-link"
          style={{ cursor: 'default', textDecoration: 'none' }}
        >
          <GitHubIcon size={15} className="section-footer-platform-icon" />
          <span>{new Date().getFullYear()} GitHub | </span>
          <Link
            to={externalUrl}
            aria-label={externalText}
            style={{ cursor: 'pointer', color: 'inherit', textDecoration: 'inherit' }}
          >
            <span>
              {externalUrl.startsWith('/resources') ? 'view resources ' : ''}
            </span>
          </Link>
        </div>
      ) : (
        <a
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="section-footer-ext-link"
          aria-label="View on GitHub"
        >
          <GitHubIcon size={15} className="section-footer-platform-icon" />
          <span>{new Date().getFullYear()} GitHub</span>
        </a>
      )}
    </footer>
  );
}

export default HistoryFooter;
