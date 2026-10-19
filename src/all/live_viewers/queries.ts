import { queryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import type { LiveViewersData, ViewerLocation, ViewerSession } from './types';

// ── Query Key Factory (TanStack Query v5 & Aurora Scharff Best Practice) ─────
export const viewerKeys = {
  all: ['live-viewers'] as const,
  geo: () => [...viewerKeys.all, 'geo'] as const,
  live: (sessionId: string, geo: ViewerLocation) =>
    [...viewerKeys.all, 'live', sessionId, geo.countryCode, geo.city] as const,
};

// ── Zod Schemas for Runtime Safety ──────────────────────────────────────────
const GeoApiResponseSchema = z.object({
  city: z.string().optional(),
  country_name: z.string().optional(),
  country: z.string().optional(),
  country_code: z.string().optional(),
  org: z.string().optional(),
  connection: z.object({ isp: z.string().optional() }).optional(),
});

const WorkerViewerSchema = z.object({
  id: z.string(),
  city: z.string().optional(),
  country: z.string().optional(),
  countryCode: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  device: z.enum(['desktop', 'mobile', 'tablet']).optional(),
  lastSeen: z.number().optional(),
});

const WorkerResponseSchema = z.object({
  success: z.boolean(),
  count: z.number().optional(),
  totalVisits: z.number().optional(),
  totalVisitors: z.number().optional(),
  viewers: z.array(WorkerViewerSchema).optional(),
});

// ── Storage Keys & Constants ─────────────────────────────────────────────────
const DEVICE_STORAGE_KEY = 'portfolio_viewer_device_id';
const TAB_STORAGE_KEY = 'portfolio_viewer_tab_id';
const SESSIONS_STORE_KEY = 'portfolio_active_sessions';
const TOTAL_VISITS_STORAGE_KEY = 'portfolio_total_visits_cache';
const SESSION_VISITED_FLAG = 'portfolio_session_counted';
const SESSION_TTL_MS = 25_000;

/**
 * Dynamically records a unique visit for the current browser session.
 * Increments the local visit counter when opening a fresh session.
 */
export function recordClientVisit(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const alreadyCounted = sessionStorage.getItem(SESSION_VISITED_FLAG);
    if (!alreadyCounted) {
      sessionStorage.setItem(SESSION_VISITED_FLAG, 'true');
      const stored = parseInt(localStorage.getItem(TOTAL_VISITS_STORAGE_KEY) || '1', 10);
      const updated = Math.max(1, isNaN(stored) ? 1 : stored + 1);
      localStorage.setItem(TOTAL_VISITS_STORAGE_KEY, updated.toString());
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Retrieves the currently persisted dynamic total visits count.
 */
export function getCachedTotalVisits(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const stored = localStorage.getItem(TOTAL_VISITS_STORAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 1;
  } catch {
    return 1;
  }
}

// ── Bot & Automation Detector (Filters Headless & Crawlers) ───────────────────
export function isLikelyBot(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;

  // 1. Automation flags (Puppeteer, Playwright, Selenium)
  if (navigator.webdriver) return true;

  // 2. Headless window dimensions
  if (window.outerWidth === 0 && window.outerHeight === 0) return true;

  // 3. User agent bot signatures
  const ua = navigator.userAgent.toLowerCase();
  if (
    /bot|crawl|spider|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|facebot|facebookexternalhit|ia_archiver|discordbot|telegrambot|slackbot|twitterbot|whatsapp|headlesschrome|bytespider|gptbot|claudebot|perplexitybot/i.test(
      ua,
    )
  ) {
    return true;
  }

  // 4. Missing language headers
  if (!navigator.languages || navigator.languages.length === 0) return true;

  return false;
}

// ── Persistent Device ID Provider (1 Device/Person = 1 ID across all tabs) ───
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'ssr';
  try {
    let id = localStorage.getItem(DEVICE_STORAGE_KEY);
    if (!id) {
      id = `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(DEVICE_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `d_${Date.now().toString(36)}`;
  }
}

// Backwards-compatible alias for existing imports
export const getOrCreateSessionId = getOrCreateDeviceId;

// ── Ephemeral Tab ID Provider ────────────────────────────────────────────────
export function getOrCreateTabId(): string {
  if (typeof window === 'undefined') return 'tab_ssr';
  try {
    let id = sessionStorage.getItem(TAB_STORAGE_KEY);
    if (!id) {
      id = `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
      sessionStorage.setItem(TAB_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return `t_${Date.now().toString(36)}`;
  }
}

// ── Instant Leave Beacon Helper ──────────────────────────────────────────────
export function sendLeaveSignal(deviceId: string): void {
  if (typeof window === 'undefined') return;
  const workerUrl = import.meta.env.VITE_FB_WORKER_URL;
  if (!workerUrl || workerUrl.includes('YOUR_SUBDOMAIN')) return;

  try {
    const base = workerUrl.replace(/\/+$/, '');
    const url = `${base}/api/viewers/leave`;
    const payload = JSON.stringify({ id: deviceId });

    // W3C Beacon API enforces credentials mode 'include'.
    // Using a CORS-safelisted MIME type ('text/plain') avoids triggering a preflight OPTIONS request,
    // preventing CORS preflight failures when the server responds with wildcard or differing origin headers.
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([payload], { type: 'text/plain;charset=UTF-8' });
      const enqueued = navigator.sendBeacon(url, blob);
      if (enqueued) return;
    }

    // Modern fetch keepalive fallback with explicit credentials: 'omit'
    void fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: payload,
      keepalive: true,
      credentials: 'omit',
      mode: 'cors',
    }).catch(() => {
      // Gracefully swallow network aborts on page teardown
    });
  } catch {
    // Graceful ignore
  }
}

// ── Country Code to Flag Emoji Helper ────────────────────────────────────────
export function getFlagEmoji(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// ── Client Environment Parser ───────────────────────────────────────────────
export function parseClientEnvironment(): {
  browser: string;
  os: string;
  device: 'desktop' | 'mobile' | 'tablet';
} {
  if (typeof window === 'undefined') {
    return { browser: 'Browser', os: 'Desktop', device: 'desktop' };
  }

  const ua = navigator.userAgent;
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk)/i.test(ua);
  const isMobile = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry/i.test(ua);
  const device: 'desktop' | 'mobile' | 'tablet' = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  let os = 'Desktop';
  if (/Windows NT/i.test(ua)) os = 'Windows';
  else if (/Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  let browser = 'Browser';
  if (/Edg\//i.test(ua)) browser = 'Edge';
  else if (/Chrome\//i.test(ua)) browser = 'Chrome';
  else if (/Firefox\//i.test(ua)) browser = 'Firefox';
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = 'Safari';
  else if (/OPR\//i.test(ua)) browser = 'Opera';

  return { browser, os, device };
}

// ── Timezone Fallback Location ───────────────────────────────────────────────
export function deriveFallbackLocation(): ViewerLocation {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (tz.includes('Manila')) return { city: 'Manila', country: 'Philippines', countryCode: 'PH', flag: '🇵🇭' };
    if (tz.includes('Tokyo')) return { city: 'Tokyo', country: 'Japan', countryCode: 'JP', flag: '🇯🇵' };
    if (tz.includes('Singapore')) return { city: 'Singapore', country: 'Singapore', countryCode: 'SG', flag: '🇸🇬' };
    if (tz.includes('London')) return { city: 'London', country: 'United Kingdom', countryCode: 'GB', flag: '🇬🇧' };
    if (tz.includes('New_York')) return { city: 'New York', country: 'United States', countryCode: 'US', flag: '🇺🇸' };
    if (tz.includes('Los_Angeles')) return { city: 'Los Angeles', country: 'United States', countryCode: 'US', flag: '🇺🇸' };
    if (tz.includes('Sydney')) return { city: 'Sydney', country: 'Australia', countryCode: 'AU', flag: '🇦🇺' };

    const parts = tz.split('/');
    const city = parts[1]?.replace(/_/g, ' ') || 'Manila';
    return { city, country: 'Philippines', countryCode: 'PH', flag: '🇵🇭' };
  } catch {
    return { city: 'Manila', country: 'Philippines', countryCode: 'PH', flag: '🇵🇭' };
  }
}

// ── Session Storage Key for Geolocation ──────────────────────────────────────
const GEO_CACHE_KEY = 'portfolio_geo_cache';

// ── Fetch Real Geolocation (Cached once per session via TanStack Query) ──────
export async function fetchGeoLocation(): Promise<ViewerLocation> {
  // 1. Fast path: return cached geolocation from sessionStorage if available
  if (typeof window !== 'undefined') {
    try {
      const cached = sessionStorage.getItem(GEO_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as ViewerLocation;
        if (parsed?.countryCode) {
          return parsed;
        }
      }
    } catch {
      // ignore parse failure
    }
  }

  const fallback = deriveFallbackLocation();
  let resolvedLocation: ViewerLocation = fallback;

  // 2. Try first-party Cloudflare Worker /api/geo if configured
  const workerUrl = import.meta.env.VITE_FB_WORKER_URL;
  if (workerUrl && !workerUrl.includes('YOUR_SUBDOMAIN')) {
    try {
      const base = workerUrl.replace(/\/+$/, '');
      const res = await fetch(`${base}/api/geo`, { method: 'GET', credentials: 'omit' });
      if (res.ok) {
        const data = (await res.json()) as { city?: string; country?: string; countryCode?: string };
        if (data && data.countryCode) {
          const countryCode = data.countryCode.toUpperCase();
          resolvedLocation = {
            city: data.city || fallback.city,
            country: data.country || fallback.country,
            countryCode,
            flag: getFlagEmoji(countryCode),
          };
          try {
            sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(resolvedLocation));
          } catch {
            // ignore
          }
          return resolvedLocation;
        }
      }
    } catch {
      // Fall through to CORS-friendly public provider
    }
  }

  // 3. Fallback: ipwho.is (CORS-friendly, no strict rate-limiting, never returns 429 without CORS headers)
  try {
    const res = await fetch('https://ipwho.is/', { method: 'GET', credentials: 'omit' });
    if (res.ok) {
      const parsed = GeoApiResponseSchema.safeParse(await res.json());
      if (parsed.success && parsed.data.country_code) {
        const countryCode = parsed.data.country_code.toUpperCase();
        resolvedLocation = {
          city: parsed.data.city || fallback.city,
          country: parsed.data.country || fallback.country,
          countryCode,
          flag: getFlagEmoji(countryCode),
          isp: parsed.data.connection?.isp,
        };
        try {
          sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(resolvedLocation));
        } catch {
          // ignore
        }
        return resolvedLocation;
      }
    }
  } catch {
    // Return timezone-derived fallback
  }

  try {
    sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(resolvedLocation));
  } catch {
    // ignore
  }

  return resolvedLocation;
}

export const viewerGeoQueryOptions = () =>
  queryOptions<ViewerLocation>({
    queryKey: viewerKeys.geo(),
    queryFn: fetchGeoLocation,
    staleTime: Infinity, // Geo coordinates do not change during a browsing session
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 1,
  });

// ── Fetch & Sync Live Viewers (Real active sessions) ─────────────────────────
export async function fetchLiveViewers(
  sessionId: string,
  geo: ViewerLocation,
): Promise<LiveViewersData> {
  const isNewVisit = recordClientVisit();
  let totalVisits = getCachedTotalVisits();

  // 1. Completely filter out crawlers, scrapers, and headless bots
  if (isLikelyBot()) {
    return {
      count: 1,
      totalVisits,
      currentViewer: geo,
      isLive: false,
    };
  }

  const now = Date.now();
  const env = parseClientEnvironment();

  const currentSession: ViewerSession = {
    id: sessionId,
    isCurrentSession: true,
    city: geo.city,
    country: geo.country,
    countryCode: geo.countryCode,
    flag: geo.flag,
    browser: env.browser,
    os: env.os,
    device: env.device,
    lastSeen: now,
  };

  let sessionCount = 1;

  // 2. Cross-tab & local session registry with TTL purging (1 device = 1 slot)
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(SESSIONS_STORE_KEY);
      const parsed: Record<string, ViewerSession> = raw ? JSON.parse(raw) : {};

      const cleaned: Record<string, ViewerSession> = {};
      Object.entries(parsed).forEach(([id, s]) => {
        if (now - s.lastSeen < SESSION_TTL_MS && id !== sessionId) {
          cleaned[id] = { ...s, isCurrentSession: false };
        }
      });

      cleaned[sessionId] = currentSession;
      localStorage.setItem(SESSIONS_STORE_KEY, JSON.stringify(cleaned));
      sessionCount = Object.keys(cleaned).length;
    } catch {
      sessionCount = 1;
    }
  }

  let uniqueVisitors: number | undefined;

  // 3. Global Cloudflare Worker + Upstash Redis synchronization
  const workerUrl = import.meta.env.VITE_FB_WORKER_URL;
  if (workerUrl && !workerUrl.includes('YOUR_SUBDOMAIN')) {
    try {
      const base = workerUrl.replace(/\/+$/, '');
      const res = await fetch(`${base}/api/viewers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...currentSession,
          isNewVisit,
        }),
      });

      if (res.ok) {
        const parsed = WorkerResponseSchema.safeParse(await res.json());
        if (parsed.success && parsed.data.success) {
          if (typeof parsed.data.count === 'number') {
            sessionCount = parsed.data.count;
          }
          if (typeof parsed.data.totalVisits === 'number' && parsed.data.totalVisits > 0) {
            totalVisits = Math.max(totalVisits, parsed.data.totalVisits);
            try {
              localStorage.setItem(TOTAL_VISITS_STORAGE_KEY, totalVisits.toString());
            } catch {
              // ignore
            }
          }
          if (typeof parsed.data.totalVisitors === 'number') {
            uniqueVisitors = parsed.data.totalVisitors;
          }
        }
      }
    } catch {
      // Gracefully maintain client session count and cached visits
    }
  }

  return {
    count: Math.max(1, sessionCount),
    totalVisits: Math.max(1, totalVisits),
    uniqueVisitors,
    currentViewer: geo,
    isLive: true,
  };
}

// ── TanStack Query v5 queryOptions (Aurora Scharff Declarative Pattern) ───────
export const liveViewersQueryOptions = (sessionId: string, geo: ViewerLocation) =>
  queryOptions<LiveViewersData>({
    queryKey: viewerKeys.live(sessionId, geo),
    queryFn: () => fetchLiveViewers(sessionId, geo),
    refetchInterval: 10_000, // Declarative polling every 10s
    refetchIntervalInBackground: false, // Save bandwidth when tab is inactive
    staleTime: 4_000,
    gcTime: 30_000,
    retry: 1,
  });
