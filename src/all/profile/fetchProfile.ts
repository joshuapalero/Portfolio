import { fetchUserProfileViaProxyOrDirect } from '../github_proxy';
import type { GithubUserProfile, FetchProfileParams } from './types';

export const DEFAULT_AVATAR_FALLBACK = 'https://github.com/joshuapalero.png?size=400';

/**
 * Resolves the user's latest GitHub avatar URL.
 * 1. Queries GitHub REST API (via Cloudflare edge proxy or direct API fallback) to get exact avatar_url
 *    and updated_at timestamp. Appending the updated_at timestamp guarantees the browser cache
 *    is automatically busted whenever the user updates their GitHub profile picture.
 * 2. If the GitHub API fails or is rate-limited, falls back to direct GitHub avatar URL
 *    https://github.com/{username}.png?size=400.
 */
export async function fetchGithubProfile(
  params: FetchProfileParams = {}
): Promise<GithubUserProfile> {
  const username = (params.username || 'joshuapalero').trim();
  const token = params.token?.trim();
  const directAvatar = `https://github.com/${encodeURIComponent(username)}.png?size=400`;

  try {
    const data = await fetchUserProfileViaProxyOrDirect<{
      login?: string;
      avatar_url?: string;
      updated_at?: string;
      name?: string;
      bio?: string;
      location?: string;
      company?: string;
      blog?: string;
      twitter_username?: string;
      public_repos?: number;
      followers?: number;
      following?: number;
    }>(username, token, params.signal);

    if (data) {
      const baseAvatarUrl: string = data.avatar_url || directAvatar;
      const updatedAt: string | undefined = data.updated_at;

      // Construct cache-busting versioned avatar URL based on GitHub's updated_at
      let avatarUrl = baseAvatarUrl;
      const separator = avatarUrl.includes('?') ? '&' : '?';
      if (updatedAt) {
        const timestamp = new Date(updatedAt).getTime();
        avatarUrl = `${avatarUrl}${separator}t=${timestamp}&size=400`;
      } else if (!avatarUrl.includes('size=')) {
        avatarUrl = `${avatarUrl}${separator}size=400`;
      }

      return {
        login: (data.login || username).trim(),
        avatarUrl,
        name: data.name ? data.name.trim() : undefined,
        bio: data.bio ? data.bio.trim() : undefined,
        location: data.location ? data.location.trim() : undefined,
        company: data.company ? data.company.trim() : undefined,
        blog: data.blog ? data.blog.trim() : undefined,
        twitterUsername: data.twitter_username ? data.twitter_username.trim() : undefined,
        publicRepos: data.public_repos,
        followers: data.followers,
        following: data.following,
        updatedAt,
      };
    }
  } catch (err) {
    if (params.signal?.aborted || (err as { name?: string })?.name === 'AbortError') {
      throw err;
    }
    console.warn('[Profile] Failed to fetch profile from GitHub API, falling back to direct avatar:', err);
  }

  return {
    login: username,
    avatarUrl: directAvatar,
  };
}
