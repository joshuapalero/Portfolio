/**
 * Client-Side Moderation, Telemetry, and Avatar Helpers.
 * Implements regulatory safety guidelines, anti-impersonation, and zero-cost privacy protection.
 */

export const KINDNESS_URL = 'https://en.wikipedia.org/wiki/Netiquette';

const BAD_LOOSE = [
  "fuck", "motherfuck", "shit", "bullshit", "bitch", "asshole", "cunt", "faggot", "nigger", "nigga",
  "dickhead", "jackass", "dumbass", "cocksuck", "dipshit", "putangina", "putanginamo", "tangina",
  "taena", "tarantado", "gago", "gaga", "ulol", "kingina", "kupal", "pakshet", "pakyu", "hinayupak",
  "hindot", "hindut", "buwiset", "bwisit", "putang ina", "tang ina", "walang hiya", "hayop ka", "gunggong"
];

const BAD_STRICT = [
  "ass", "dick", "cock", "prick", "slut", "whore", "twat", "wank", "piss", "bastard", "pussy",
  "puta", "tanga", "bobo", "tite", "titi", "puki", "pekpek", "jakol", "leche", "peste", "lintik", "ungas", "inutil"
];

const LINK_TLDS = [
  "com", "net", "org", "io", "co", "dev", "app", "ai", "xyz", "info", "biz", "link", "site", "online",
  "store", "shop", "page", "live", "tech", "cloud", "click", "me", "ly", "gg", "gl", "be", "to", "tv",
  "fm", "sh", "cc", "ws", "ph", "uk", "ca", "au", "de", "jp", "eu", "edu", "gov", "top", "vip", "pro", "fun", "icu"
];

export const BULLY_WORDS = [
  "palero",
  "laden",
  "alden",
  "aldin",
  "ben laden",
  "bin laden",
  "bin odam",
  "kamatis",
  "benladen",
  "binladen",
  "binodam",
  "ben ladin",
  "bin ladin",
  "benladin",
  "binladin",
  "osama",
] as const;

export const RESERVED_NAMES = [
  'joshua palero',
  'joshua',
  'palero',
  'admin',
  'administrator',
  'portfolio owner',
  'system',
  'moderator',
] as const;

/**
 * Prevents user impersonation of the portfolio owner or administrators.
 */
export function isReservedName(name: string): boolean {
  const normalized = (name || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return RESERVED_NAMES.some((r) => normalized === r || normalized.startsWith(`${r} `));
}

export function isOffensive(text: string): boolean {
  if (!text) return false;
  const t = text.normalize('NFC').toLowerCase();
  const collapsed = t.replace(/[^a-z0-9]/g, '');

  // 1. Bully words check (matches raw text, exact phrase, and punctuation/space-stripped evasion)
  for (const b of BULLY_WORDS) {
    if (t.includes(b)) return true;
    const collapsedB = b.replace(/[^a-z0-9]/g, '');
    if (collapsedB && collapsed.includes(collapsedB)) return true;
  }

  // 2. Loose profanities
  for (const w of BAD_LOOSE) {
    if (t.includes(w)) return true;
  }

  // 3. Strict word-boundary profanities
  for (const w of BAD_STRICT) {
    try {
      if (new RegExp(`\\b${w.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'u').test(t)) {
        return true;
      }
    } catch {
      // fallback
    }
  }
  return false;
}

export function containsLink(text: string): boolean {
  const t = (text || '').toLowerCase();
  if (/https?:\/\//.test(t)) return true;
  if (/(?:^|[^a-z0-9])www\.[a-z0-9]/.test(t)) return true;
  try {
    return new RegExp(`[a-z0-9][a-z0-9-]*\\.(?:${LINK_TLDS.join('|')})\\b`).test(t);
  } catch {
    return false;
  }
}

export function detectDevice(): string {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return 'device';
  const ua = navigator.userAgent || '';
  const touch = navigator.maxTouchPoints || 0;
  if (/iPad/.test(ua) || (/Macintosh/.test(ua) && touch > 1)) return 'iPad';
  if (/iPhone|iPod/.test(ua)) return 'iPhone';
  if (/Android/.test(ua)) return /Mobile/.test(ua) ? 'Android' : 'Android tablet';
  if (/Macintosh|Mac OS X/.test(ua)) return 'Mac';
  if (/Windows/.test(ua)) return 'Windows';
  if (/CrOS/.test(ua)) return 'Chromebook';
  if (/Linux/.test(ua)) return 'Linux';
  return 'device';
}

export function getVisitorId(): string {
  if (typeof window === 'undefined') return 'anon';
  try {
    let id = localStorage.getItem('visitorId') || localStorage.getItem('portfolio_viewer_device_id');
    if (!id) {
      id = window.crypto && crypto.randomUUID
        ? crypto.randomUUID()
        : Date.now().toString(36) + Math.random().toString(36).slice(2);
      localStorage.setItem('visitorId', id);
    }
    return id;
  } catch {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }
}

export function getAvatarUrl(name: string, isVerified?: boolean): string {
  if (isVerified) {
    return 'https://github.com/joshuapalero.png?size=100';
  }
  return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(name || 'visitor')}&radius=50&backgroundColor=f1f1f1`;
}

let cachedLocation: string | null = null;
export async function getClientLocation(): Promise<string> {
  if (cachedLocation) return cachedLocation;
  if (typeof window === 'undefined') return '';

  try {
    const stored = sessionStorage.getItem('chat_visitor_loc');
    if (stored) {
      cachedLocation = stored;
      return stored;
    }
  } catch (e) {
    void e;
  }

  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 1200);
    const r = await fetch('https://ipwho.is/', { signal: ctrl.signal });
    clearTimeout(to);
    const d = await r.json();
    if (d && d.success !== false) {
      const loc = [d.city, d.country_code].filter(Boolean).join(', ') || d.country || '';
      cachedLocation = loc;
      try {
        sessionStorage.setItem('chat_visitor_loc', loc);
      } catch (err) {
        void err;
      }
      return loc;
    }
  } catch {
    // ignore network/adblock error
  }
  return '';
}

// Pre-warm location in the background
if (typeof window !== 'undefined') {
  setTimeout(() => {
    getClientLocation().catch(() => {});
  }, 500);
}

export function openCommunityChat(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('open-community-chat'));
  }
}

export function timeAgo(iso: string): string {
  const then = iso ? new Date(iso).getTime() : NaN;
  if (isNaN(then)) return '';
  const s = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (s < 10) return 'just now';
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}
