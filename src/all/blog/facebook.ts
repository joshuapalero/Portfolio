import type { FacebookPost, ProxyPostDto, ProxyResponseDto } from './types';

/**
 * Transforms plain text into an SEO-friendly URL slug.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

/**
 * Derives a clean, human-readable title from the post message.
 */
function extractTitle(message: string): string {
  const trimmed = message.trim();
  if (!trimmed) {
    return 'Facebook Update';
  }

  const firstLine = trimmed.split('\n').find((line) => line.trim().length > 0) ?? trimmed;
  if (firstLine.length <= 90) {
    return firstLine;
  }

  return `${firstLine.slice(0, 87).trimEnd()}...`;
}

/**
 * Formats ISO 8601 date into full readable format (e.g. "September 8, 2026").
 * Includes day for precise identification of posts within the same month.
 */
function formatDate(isoString: string): string {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) {
    return 'Recent';
  }

  return parsed.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Estimates reading time in minutes based on average 200 words/min.
 */
function calculateReadingTime(text: string): string {
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `${minutes} min`;
}

/**
 * Normalizes a raw Facebook DTO from the Cloudflare Worker into a domain FacebookPost.
 */
export function normalizeProxyPost(dto: ProxyPostDto): FacebookPost {
  const message = dto.message ?? '';
  const title = extractTitle(message);
  
  // Extract post unique id suffix (e.g. from "pageid_postid")
  const idSuffix = dto.id.includes('_') ? (dto.id.split('_')[1] ?? dto.id) : dto.id;
  const baseSlug = slugify(title) || 'post';
  const slug = `${baseSlug}-${idSuffix}`;

  const paragraphs = message
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const excerpt =
    message.length > 180 ? `${message.slice(0, 177).trimEnd()}...` : message;

  // Build human-readable place name from API fields
  const placeParts: string[] = [];
  if (dto.place_name) placeParts.push(dto.place_name);
  if (dto.place_city && !dto.place_name?.includes(dto.place_city)) placeParts.push(dto.place_city);
  if (dto.place_country && !placeParts.some((p) => p.includes(dto.place_country!))) placeParts.push(dto.place_country);
  const placeName = placeParts.join(', ') || undefined;

  return {
    id: dto.id,
    slug,
    title,
    date: formatDate(dto.created_time),
    rawDate: dto.created_time,
    readTime: calculateReadingTime(message),
    excerpt,
    content: Object.freeze(paragraphs.length > 0 ? paragraphs : [message]),
    imageUrl: dto.full_picture ?? undefined,
    permalinkUrl: dto.permalink_url,
    reactionsCount: dto.reactions_count ?? 0,
    commentsCount: dto.comments_count ?? 0,
    sharesCount: dto.shares_count ?? 0,
    placeName,
    story: dto.story || undefined,
  };
}

/**
 * Classifies whether a Facebook post is blog-style written content vs a
 * simple photo upload. Blog posts have substantial text (≥ 30 words) and
 * should appear in the Blog section regardless of whether they have an
 * attached cover image. Short-caption photo posts (< 30 words) belong in
 * the Gallery section.
 *
 * This prevents blog articles with cover images from being misrouted to
 * the Gallery, and ensures only genuine photo uploads appear there.
 */
export function isBlogStylePost(post: FacebookPost): boolean {
  const text = post.content.join(' ') || post.excerpt || post.title || '';
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return wordCount >= 30;
}

/**
 * Fetches all live posts directly from the Cloudflare Worker proxy.
 * Throws explicit, descriptive errors when unconfigured or failing.
 */
export const DEFAULT_WORKER_URL = 'https://facebook-proxy.joshuapalero.workers.dev';

export async function fetchFacebookPosts(): Promise<readonly FacebookPost[]> {
  const configured = import.meta.env.VITE_FB_WORKER_URL;
  const workerUrl =
    configured && !configured.includes('YOUR_SUBDOMAIN')
      ? configured.trim().replace(/\/+$/, '')
      : DEFAULT_WORKER_URL;

  const endpoint = `${workerUrl}/api/facebook-posts`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Worker responded with HTTP ${response.status}: ${response.statusText}`);
  }

  const data: ProxyResponseDto = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to retrieve Facebook posts from proxy.');
  }

  return Object.freeze(data.posts.map(normalizeProxyPost));
}
