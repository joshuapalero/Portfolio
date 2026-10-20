import {
  type RecommendationComment,
  type NewRecommendationPayload,
  recommendationsSchema,
  recommendationCommentSchema,
} from './types';
import { getAvatarDataUri, SKETCH_AVATARS, getBleachAvatarMeta, BLEACH_AVATARS_META } from '../live_viewers';

export { getAvatarDataUri, SKETCH_AVATARS, getBleachAvatarMeta, BLEACH_AVATARS_META };

export const BROADCAST_CHANNEL = 'portfolio_recommendations_sync';
const USER_STORAGE_KEY = 'portfolio_user_recommendations_v2';

/**
 * Resolves the configured Edge Worker or REST API Base URL.
 * Checks for dedicated `VITE_RECOMMENDATIONS_API_URL` first,
 * then falls back to portfolio-wide `VITE_WORKER_URL` or `VITE_FB_WORKER_URL`.
 */
export function getRecommendationsApiUrl(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const url =
      import.meta.env.VITE_RECOMMENDATIONS_API_URL ||
      import.meta.env.VITE_WORKER_URL ||
      import.meta.env.VITE_FB_WORKER_URL;

    if (url && !url.includes('YOUR_SUBDOMAIN')) {
      return url.trim().replace(/\/+$/, '');
    }
  }
  return 'https://facebook-proxy.joshuapalero.workers.dev';
}

/**
 * Deterministically maps any person's name to a live-viewer sketch avatar index.
 * Case-insensitive, whitespace-trimmed, and guaranteed to return a valid index in [0, SKETCH_AVATARS.length - 1].
 */
export function getSketchAvatarIndex(name: string): number {
  const normalized = (name || '').trim().toLowerCase();
  if (!normalized) return 0;
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) | 0;
  }
  const total = SKETCH_AVATARS.length || 4;
  return ((hash % total) + total) % total;
}

/**
 * Resolves the sketch avatar data URI for a recommendation comment,
 * matching the live viewing section's hand-drawn avatars 1:1.
 */
export function getCommentAvatarUri(
  comment: { name: string; avatarIndex?: number }
): string {
  const index =
    typeof comment.avatarIndex === 'number'
      ? comment.avatarIndex
      : getSketchAvatarIndex(comment.name);
  return getAvatarDataUri(index);
}

/**
 * Tier 2: Fetches external, non-hardcoded seed recommendations from the decoupled
 * static asset (`/data/recommendations.json`).
 */
async function fetchExternalSeedRecommendations(
  signal?: AbortSignal
): Promise<readonly RecommendationComment[]> {
  if (typeof window === 'undefined') return [];
  try {
    const res = await fetch('/data/recommendations.json', {
      signal,
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[Recommendations] External /data/recommendations.json returned status ${res.status}`);
      return [];
    }

    const raw = await res.json();
    const result = recommendationsSchema.safeParse(raw);
    if (result.success) {
      return result.data;
    }

    console.warn('[Recommendations] Schema validation failed for /data/recommendations.json:', result.error);
    return [];
  } catch (err) {
    if (signal?.aborted || (err as { name?: string })?.name === 'AbortError') {
      return [];
    }
    console.warn('[Recommendations] Failed to fetch /data/recommendations.json:', err);
    return [];
  }
}

/**
 * Tier 3: Retrieves user-submitted recommendations persisted in client storage.
 * Automatically cleans up any legacy mock seed items cached from earlier versions.
 */
function getStoredUserRecommendations(): RecommendationComment[] {
  if (typeof window === 'undefined') return [];
  try {
    // Clean up obsolete development keys and previous test data
    localStorage.removeItem('portfolio_live_recommendations');
    localStorage.removeItem('portfolio_user_recommendations');

    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = recommendationsSchema.safeParse(parsed);
    if (!result.success) return [];

    // Filter out any legacy mock seed IDs from earlier versions
    const userOnly = result.data.filter(
      (item) => !item.id.startsWith('rec-init-') && !item.id.startsWith('rec-seed-')
    );

    if (userOnly.length !== result.data.length) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userOnly));
    }

    return userOnly;
  } catch (err) {
    console.warn('[Recommendations] Failed to read user submissions from storage:', err);
    return [];
  }
}

/**
 * Merges external seed data and local submissions, deduplicating by ID and sorting by date descending.
 */
function mergeAndSortRecommendations(
  seedList: readonly RecommendationComment[],
  userList: readonly RecommendationComment[]
): RecommendationComment[] {
  const map = new Map<string, RecommendationComment>();

  // Add external seed recommendations
  for (const item of seedList) {
    map.set(item.id, item);
  }

  // Overlay user-submitted recommendations
  for (const item of userList) {
    map.set(item.id, item);
  }

  return Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * RecommendationRepository contract adhering to Clean Architecture
 * and Martin Fowler's Repository Pattern.
 */
export interface RecommendationRepository {
  getAll(signal?: AbortSignal): Promise<RecommendationComment[]>;
  create(payload: NewRecommendationPayload): Promise<RecommendationComment>;
}

/**
 * Multi-Tier Resilient Implementation of RecommendationRepository:
 *
 * 1. Primary: Cloudflare Edge Worker API / REST Backend if configured.
 * 2. Fallback: External decoupled `/data/recommendations.json` HTTP asset.
 * 3. Client Layer: LocalStorage persistence + multi-tab real-time BroadcastChannel sync.
 */
export const recommendationRepository: RecommendationRepository = {
  async getAll(signal?: AbortSignal): Promise<RecommendationComment[]> {
    const apiUrl = getRecommendationsApiUrl();
    let remoteItems: RecommendationComment[] = [];
    let remoteSuccess = false;

    // ── Tier 1: Remote API / Cloudflare Edge Worker (D1 SQL) ──
    if (apiUrl) {
      try {
        const endpoint = `${apiUrl}/api/recommendations`;
        const res = await fetch(endpoint, {
          signal,
          headers: { Accept: 'application/json' },
        });

        if (res.ok) {
          const raw = await res.json();
          const candidate = Array.isArray(raw) ? raw : (raw as { data?: unknown })?.data;
          const result = recommendationsSchema.safeParse(candidate);
          if (result.success) {
            remoteItems = result.data;
            remoteSuccess = true;
          }
        } else {
          console.warn(`[Recommendations] API endpoint returned status ${res.status}, falling back to client storage.`);
        }
      } catch (err) {
        if (signal?.aborted || (err as { name?: string })?.name === 'AbortError') {
          throw err;
        }
        console.warn('[Recommendations] Remote API request failed, falling back to client storage:', err);
      }
    }

    // ── Tier 2 & 3: Decoupled External JSON + Client Persistence ──
    const [externalSeeds, userSubmissions] = await Promise.all([
      fetchExternalSeedRecommendations(signal),
      Promise.resolve(getStoredUserRecommendations()),
    ]);

    const combinedSeeds = remoteSuccess
      ? [...externalSeeds, ...remoteItems]
      : externalSeeds;

    return mergeAndSortRecommendations(combinedSeeds, userSubmissions);
  },

  async create(payload: NewRecommendationPayload): Promise<RecommendationComment> {
    const currentDate = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());

    const newCommentRaw = {
      id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: payload.name.trim(),
      role: payload.role?.trim() || 'Verified Endorsement',
      description: payload.description.trim(),
      date: currentDate,
      createdAt: Date.now(),
      avatarIndex:
        typeof payload.avatarIndex === 'number'
          ? payload.avatarIndex
          : getSketchAvatarIndex(payload.name),
    };

    const parsed = recommendationCommentSchema.parse(newCommentRaw);

    // If a remote edge API is configured, forward the submission to the server
    const apiUrl = getRecommendationsApiUrl();
    if (apiUrl) {
      try {
        const endpoint = `${apiUrl}/api/recommendations`;
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        });
      } catch (err) {
        console.warn('[Recommendations] Failed to forward post to remote API, preserving locally:', err);
      }
    }

    // Always persist in local user submissions for client resilience
    if (typeof window !== 'undefined') {
      try {
        const currentSubmissions = getStoredUserRecommendations();
        const updated = [parsed, ...currentSubmissions];
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));

        // Notify other open browser tabs
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel(BROADCAST_CHANNEL);
          channel.postMessage({ type: 'RECOMMENDATION_ADDED', payload: parsed });
          channel.close();
        }
      } catch (err) {
        console.error('[Recommendations] Failed to persist user submission locally:', err);
      }
    }

    return parsed;
  },
};

/**
 * Re-export functions for backward compatibility with existing components and hooks.
 */
export async function loadRecommendations(signal?: AbortSignal): Promise<RecommendationComment[]> {
  return recommendationRepository.getAll(signal);
}

export async function addRecommendation(payload: NewRecommendationPayload): Promise<RecommendationComment> {
  return recommendationRepository.create(payload);
}

export function clearAllStoredRecommendations(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('portfolio_user_recommendations');
    localStorage.removeItem('portfolio_live_recommendations');
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel(BROADCAST_CHANNEL);
      channel.postMessage({ type: 'RECOMMENDATIONS_CLEARED' });
      channel.close();
    }
  } catch (err) {
    console.warn('[Recommendations] Failed to clear stored recommendations:', err);
  }
}
