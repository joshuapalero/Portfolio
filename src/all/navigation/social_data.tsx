import { ThumbsUp, GitBranch } from 'lucide-react';
import { GitHubIcon } from '../ui';
import type { SocialLinkItem } from './types';

const linkedinIcon = '/linkedin.png';
const facebookIcon = '/facebook.png';
const instagramIcon = '/instagram.png';

/**
 * The actual resume PDF present in /public.
 * VITE_RESUME_URL env var overrides this at build time.
 */
export const DEFAULT_RESUME_URL =
  (typeof import.meta !== 'undefined'
    ? import.meta.env?.VITE_RESUME_URL
    : undefined) || '/Joshua Pasacay Palero Resume.pdf';

/**
 * Resolves social profile URLs from env vars with safe fallbacks.
 * Set the corresponding VITE_* variable in .env to override for production.
 */
function getSocialUrl(envKey: string, placeholder: string): string {
  const val =
    typeof import.meta !== 'undefined'
      ? (import.meta.env as Record<string, string | undefined>)?.[envKey]
      : undefined;
  return val?.trim() || placeholder;
}

export function getSocialLinks(
  username = 'joshuapalero',
  // resumeUrl kept for API compatibility — Resume nav item removed from socials
  _resumeUrl = DEFAULT_RESUME_URL
): SocialLinkItem[] {

  // Env-configurable social URLs — set in .env to avoid broken placeholder links
  const linkedinUrl = getSocialUrl('VITE_LINKEDIN_URL', 'https://linkedin.com/in/joshuapalero');
  const facebookUrl = getSocialUrl('VITE_FACEBOOK_URL', 'https://facebook.com/joshuapalero');
  const instagramUrl = getSocialUrl('VITE_INSTAGRAM_URL', 'https://instagram.com/joshuapalero');

  // LinkedIn handle parsed from URL path (e.g. linkedin.com/in/joshuapalero → joshuapalero)
  const linkedinHandle = (() => {
    try {
      const parsed = new URL(linkedinUrl);
      const segments = parsed.pathname.split('/').filter(Boolean);
      const inIdx = segments.indexOf('in');
      return inIdx !== -1 && segments[inIdx + 1]
        ? segments[inIdx + 1]
        : 'Joshua Palero';
    } catch {
      return 'Joshua Palero';
    }
  })();

  return [
    {
      id: 'github',
      label: 'GitHub',
      href: `https://github.com/${username}`,
      handle: `@${username}`,
      description: 'Repositories & code',
      icon: <GitHubIcon size={16} className="social-icon github-icon" />,
    },
    {
      id: 'github-activity',
      label: 'Github Activity',
      href: '/practice-activity',
      handle: 'Practice Activity',
      description: 'Git guides & practice cheat sheets',
      isInternal: true,
      icon: <GitBranch size={16} className="social-icon" />,
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      href: linkedinUrl,
      handle: linkedinHandle,
      description: 'Professional network',
      icon: <img src={linkedinIcon} alt="LinkedIn" className="social-icon" />,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      href: facebookUrl,
      handle: 'Facebook Feed',
      description: 'Posts & social updates',
      icon: <img src={facebookIcon} alt="Facebook" className="social-icon" />,
    },
    {
      id: 'instagram',
      label: 'Instagram',
      href: instagramUrl,
      handle: `@${instagramUrl.split('/').filter(Boolean).pop() ?? 'instagram'}`,
      description: 'Visual moments & life',
      icon: <img src={instagramIcon} alt="Instagram" className="social-icon" />,
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      href: '/recommendations',
      handle: 'Peer reviews',
      description: 'Community endorsements',
      isInternal: true,
      icon: <ThumbsUp size={16} className="social-icon" />,
    },
  ];
}
