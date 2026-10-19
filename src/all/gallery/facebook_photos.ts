import type { FacebookPost } from '../blog/types';
import { isBlogStylePost } from '../blog/facebook';
import type { FacebookPhoto } from './types';

/**
 * Pure transformation function: extracts only genuine photo uploads from Facebook posts.
 * Excludes blog-style posts (≥ 30 words) that happen to have attached cover images,
 * ensuring only real user-uploaded pictures appear in the Gallery section.
 * Intelligently parses Place, Event, Date, and Description.
 */
export function extractFacebookPhotos(
  posts: readonly FacebookPost[],
): readonly FacebookPhoto[] {
  const extracted = posts
    .filter((post): post is FacebookPost & { readonly imageUrl: string } => {
      // Must have an image
      if (typeof post.imageUrl !== 'string' || post.imageUrl.trim().length === 0) return false;
      // Exclude blog-style posts — they belong in the Blog section
      if (isBlogStylePost(post)) return false;
      return true;
    })
    .map((post) => {
      const fullText =
        post.content && post.content.length > 0
          ? post.content.join('\n\n')
          : post.excerpt || post.title || '';

      const meta = parsePhotoMetadata(fullText, post.title, post.date);

      // Prefer API-provided place from Facebook Graph API check-in data
      // over text-parsing heuristics when available.
      const place = post.placeName || meta.place;

      return {
        id: post.id,
        imageUrl: post.imageUrl,
        caption: post.title || post.excerpt || 'Facebook Photo',
        date: meta.date || post.date,
        rawDate: post.rawDate,
        permalinkUrl: post.permalinkUrl,
        reactionsCount: post.reactionsCount,
        commentsCount: post.commentsCount,
        place,
        event: meta.event,
        description: meta.description,
      };
    });

  return Object.freeze(extracted);
}

/**
 * Intelligent parser: Extracts event, place, date, and description from caption text.
 * Adapts to explicit prefixes ("Location:", "Event:"), emojis (📍, 🎪), or semantic keywords.
 */
export function parsePhotoMetadata(
  text: string,
  fallbackTitle: string = 'Software Milestone',
  fallbackDate: string = 'Recent',
): {
  readonly event: string;
  readonly place: string;
  readonly date: string;
  readonly description: string;
} {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  let event = '';
  let place = '';
  let customDate = '';
  const descLines: string[] = [];

  for (const line of lines) {
    const eventMatch = line.match(
      /^(?:event|occasion|activity|summit|conference|meetup|hackathon|workshop|seminar|milestone|topic)[\s:—–-]+(.*)$/iu,
    );
    const placeMatch = line.match(
      /^(?:location|place|venue|site|city|address|at|in)[\s:—–-]+(.*)$/iu,
    );
    const dateMatch = line.match(/^(?:date|when|held on|time)[\s:—–-]+(.*)$/iu);

    if (eventMatch && !event) {
      event = eventMatch[1].trim();
    } else if (placeMatch && !place) {
      place = placeMatch[1].trim();
    } else if (dateMatch && !customDate) {
      customDate = dateMatch[1].trim();
    } else if ((line.startsWith('📍') || line.startsWith('🗺️')) && !place) {
      place = line.replace(/^(?:📍|🗺️)\s*[:—–-]?\s*/u, '').trim();
    } else if (
      (line.startsWith('🎪') ||
        line.startsWith('🎉') ||
        line.startsWith('🏆') ||
        line.startsWith('🎯')) &&
      !event
    ) {
      event = line.replace(/^(?:🎪|🎉|🏆|🎯)\s*[:—–-]?\s*/u, '').trim();
    } else {
      descLines.push(line);
    }
  }

  // Infer event from fallback title if not matched
  if (!event) {
    if (fallbackTitle && fallbackTitle !== 'Facebook Photo' && fallbackTitle !== 'Facebook Update') {
      event = fallbackTitle;
    } else {
      event = 'Software Showcase';
    }
  }

  // Infer location if not matched
  if (!place) {
    const lower = text.toLowerCase();
    if (lower.includes('manila')) place = 'Manila, Philippines';
    else if (lower.includes('bgc') || lower.includes('taguig')) place = 'BGC, Taguig City';
    else if (lower.includes('quezon city')) place = 'Quezon City, Philippines';
    else if (lower.includes('makati')) place = 'Makati City, Philippines';
    else if (lower.includes('pasay') || lower.includes('smx')) place = 'Pasay City, Philippines';
    else if (lower.includes('cebu')) place = 'Cebu, Philippines';
    else place = 'Manila, Philippines';
  }

  const description = descLines.length > 0 ? descLines.join('\n\n') : text.trim() || fallbackTitle;

  return {
    event,
    place,
    date: customDate || fallbackDate,
    description,
  };
}

/**
 * Curated showcase portfolio photos.
 * Ensures the gallery section and dedicated gallery page display rich cards
 * with place, event, date, and vertically adjusting descriptions of varying lengths.
 */
export const CURATED_SHOWCASE_PHOTOS: readonly FacebookPhoto[] = Object.freeze([
  {
    id: 'showcase-1',
    imageUrl:
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    caption: 'Philippine Web Developers Summit — Architecture & Scaling Keynote',
    date: 'August 2025',
    rawDate: '2025-08-14T09:00:00Z',
    permalinkUrl: '',
    reactionsCount: 142,
    commentsCount: 28,
    place: 'SMX Convention Center, Pasay City',
    event: 'Philippine Web Developers Summit',
    description:
      'Delivered an interactive tech talk on modern client-side caching strategies and edge proxy architecture before an audience of over 400 software engineers, student leaders, and industry professionals.',
  },
  {
    id: 'showcase-2',
    imageUrl:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    caption: 'Cloud Native Manila Hackathon — 48-Hour Sprint',
    date: 'May 2025',
    rawDate: '2025-05-20T14:30:00Z',
    permalinkUrl: '',
    reactionsCount: 98,
    commentsCount: 19,
    place: 'BGC Innovation Hub, Taguig City',
    event: 'Cloud Native Manila Hackathon',
    description:
      'Collaborated with a 4-person engineering squad to design and deploy a distributed disaster-relief monitoring platform with automated offline syncing and real-time WebSocket notifications. Awarded 1st Runner Up for system reliability and real-world impact.',
  },
  {
    id: 'showcase-3',
    imageUrl:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    caption: 'Enterprise HRMIS Production Platform Launch',
    date: 'November 2024',
    rawDate: '2024-11-08T11:00:00Z',
    permalinkUrl: '',
    reactionsCount: 215,
    commentsCount: 45,
    place: 'Municipal Hall Executive Lounge, Calapan',
    event: 'Enterprise HRMIS System Launch',
    description:
      'Officially rolled out the comprehensive Human Resource Management Information System (HRMIS) for municipal administration. The platform manages complete employee lifecycles, real-time biometric attendance processing, leave applications, automated service records, and civil service compliant performance reviews. Featuring role-based access control (RBAC), multi-tenant isolation, and optimized database indexing to handle concurrent daily staff transactions with zero downtime.',
  },
  {
    id: 'showcase-4',
    imageUrl:
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
    caption: 'Google Developer Groups DevFest Philippines',
    date: 'October 2024',
    rawDate: '2024-10-18T10:00:00Z',
    permalinkUrl: '',
    reactionsCount: 88,
    commentsCount: 14,
    place: 'Google Philippines, Taguig City',
    event: 'GDG DevFest Philippines',
    description:
      'Participated in hands-on workshops on serverless edge compute, Cloudflare Workers microservices, and TypeScript 5 type-level programming. Connected with fellow developers discussing scalable architectural patterns.',
  },
  {
    id: 'showcase-5',
    imageUrl:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    caption: 'Bachelor of Science in Information Technology Graduation',
    date: 'July 2024',
    rawDate: '2024-07-12T16:00:00Z',
    permalinkUrl: '',
    reactionsCount: 340,
    commentsCount: 82,
    place: 'University Campus Auditorium, Manila',
    event: 'Academic Commencement & Capstone Honors',
    description:
      'Successfully graduated with a Bachelor of Science in Information Technology. Celebrated four formative years of software engineering, algorithmic research, open-source projects, and capstone system defense with mentors, peers, and family.',
  },
  {
    id: 'showcase-6',
    imageUrl:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80',
    caption: 'Engineering Team Sprint Review & Tech Retrospective',
    date: 'February 2024',
    rawDate: '2024-02-28T15:00:00Z',
    permalinkUrl: '',
    reactionsCount: 64,
    commentsCount: 9,
    place: 'Makati Software Hub, Makati City',
    event: 'Quarterly Tech Retrospective',
    description:
      'Conducted sprint retrospective analyzing query performance improvements and UI responsiveness metrics across distributed client portals.',
  },
]);

/**
 * Direct fetcher for Facebook Photos API from the Cloudflare Worker proxy.
 * If the worker supports /api/facebook-photos, it uses it directly;
 * otherwise it transparently falls back to extracting photo posts from /api/facebook-posts.
 */
export async function fetchFacebookPhotos(): Promise<readonly FacebookPhoto[]> {
  const workerUrl = import.meta.env.VITE_FB_WORKER_URL;

  if (!workerUrl || workerUrl.includes('YOUR_SUBDOMAIN')) {
    throw new Error('VITE_FB_WORKER_URL is not configured with your active Cloudflare Worker.');
  }

  const base = workerUrl.replace(/\/+$/, '');

  // Attempt dedicated /api/facebook-photos endpoint first
  try {
    const photosRes = await fetch(`${base}/api/facebook-photos`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (photosRes.ok) {
      const data = await photosRes.json();
      if (data.success && Array.isArray(data.photos)) {
        return Object.freeze(
          data.photos.map((p: Record<string, unknown>) => {
            const rawDate = String(p.created_time || '');
            const dateStr = p.created_time
              ? new Date(rawDate).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Recent';
            const caption = String(p.name || p.caption || 'Facebook Photo');
            const meta = parsePhotoMetadata(caption, caption, dateStr);

            // Prefer API place from worker over text-parsed heuristic
            const placeParts: string[] = [];
            const pName = String(p.place_name || '');
            const pCity = String(p.place_city || '');
            const pCountry = String(p.place_country || '');
            if (pName) placeParts.push(pName);
            if (pCity && !pName.includes(pCity)) placeParts.push(pCity);
            if (pCountry && !placeParts.some((s) => s.includes(pCountry))) placeParts.push(pCountry);
            const apiPlace = placeParts.join(', ');

            return {
              id: String(p.id),
              imageUrl: String(p.full_picture || p.picture || ''),
              caption,
              date: meta.date || dateStr,
              rawDate,
              permalinkUrl: String(p.link || p.permalink_url || ''),
              reactionsCount: Number(p.reactions_count || 0),
              commentsCount: Number(p.comments_count || 0),
              place: apiPlace || meta.place,
              event: meta.event,
              description: meta.description,
            };
          }),
        );
      }
    }
  } catch {
    // Fall back gracefully to posts endpoint
  }

  // Fallback: Fetch /api/facebook-posts and extract photos
  const postsRes = await fetch(`${base}/api/facebook-posts`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!postsRes.ok) {
    throw new Error(`Worker responded with HTTP ${postsRes.status}: ${postsRes.statusText}`);
  }

  const data = await postsRes.json();
  if (!data.success || !Array.isArray(data.posts)) {
    throw new Error(data.error || 'Failed to retrieve Facebook photos from proxy.');
  }

  return Object.freeze(
    data.posts
      .filter((p: Record<string, unknown>) => {
        // Must have an image
        if (!p.full_picture) return false;
        // Exclude blog-style posts (≥ 30 words) — they belong in the Blog section
        const msg = String(p.message || '');
        const wordCount = msg.trim().split(/\s+/).filter(Boolean).length;
        return wordCount < 30;
      })
      .map((p: Record<string, unknown>) => {
        const rawDate = String(p.created_time || '');
        const dateStr = p.created_time
          ? new Date(rawDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Recent';
        const msg = String(p.message || 'Facebook Photo');
        const meta = parsePhotoMetadata(msg, 'Software Milestone', dateStr);

        // Prefer API place from worker over text-parsed heuristic
        const placeParts: string[] = [];
        const pName = String(p.place_name || '');
        const pCity = String(p.place_city || '');
        const pCountry = String(p.place_country || '');
        if (pName) placeParts.push(pName);
        if (pCity && !pName.includes(pCity)) placeParts.push(pCity);
        if (pCountry && !placeParts.some((s) => s.includes(pCountry))) placeParts.push(pCountry);
        const apiPlace = placeParts.join(', ');

        return {
          id: String(p.id),
          imageUrl: String(p.full_picture),
          caption: msg,
          date: meta.date || dateStr,
          rawDate,
          permalinkUrl: String(p.permalink_url || ''),
          reactionsCount: Number(p.reactions_count || 0),
          commentsCount: Number(p.comments_count || 0),
          place: apiPlace || meta.place,
          event: meta.event,
          description: meta.description,
        };
      }),
  );
}

