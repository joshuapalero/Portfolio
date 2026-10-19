/**
 * Cloudflare Worker — Facebook Graph API Proxy
 *
 * Proxies requests to the Facebook Graph API so the Page Access Token
 * is never exposed to the browser. Responses are edge-cached for 30 min.
 *
 * Environment secrets (set via `wrangler secret put`):
 *   FB_PAGE_ID            – Your Facebook Page ID
 *   FB_PAGE_ACCESS_TOKEN  – Never-expiring Page Access Token
 *
 * Allowed origins can be tightened via the ALLOWED_ORIGIN env var.
 */

export interface Env {
  FB_PAGE_ID?: string;
  FB_PAGE_ACCESS_TOKEN?: string;
  ALLOWED_ORIGIN?: string;
  UPSTASH_REDIS_REST_URL?: string;
  UPSTASH_REDIS_REST_TOKEN?: string;
  GITHUB_TOKEN?: string;
  CHAT_ADMIN_PASSWORD?: string;
  DB?: D1Database;
  portfolio_db?: D1Database;
}

// ── Facebook response types ──────────────────────────────────────────────────

interface FacebookPost {
  id: string;
  message?: string;
  full_picture?: string;
  created_time: string;
  permalink_url: string;
  shares?: { count: number };
  place?: {
    name?: string;
    location?: { city?: string; country?: string };
  };
  story?: string;
  reactions?: { summary?: { total_count: number } };
  comments?: { summary?: { total_count: number } };
}

interface FacebookPhotoItem {
  id: string;
  name?: string;
  picture?: string;
  images?: { source: string; width?: number; height?: number }[];
  created_time: string;
  link?: string;
  place?: {
    name?: string;
    location?: { city?: string; country?: string };
  };
  reactions?: { summary?: { total_count: number } };
  comments?: { summary?: { total_count: number } };
}

interface GraphApiResponse {
  data?: (FacebookPost | FacebookPhotoItem)[];
  error?: { message: string; type?: string; code?: number };
}

// ── Constants ────────────────────────────────────────────────────────────────

const GRAPH_API_VERSION = 'v21.0';
const CACHE_TTL_SECONDS = 30 * 60; // 30 minutes
const DEFAULT_LIMIT = 25;

const FIELDS = [
  'id',
  'message',
  'full_picture',
  'created_time',
  'permalink_url',
  'shares',
  'place{name,location{city,country}}',
  'story',
  'reactions.summary(true).limit(0)',
  'comments.summary(true).limit(0)',
].join(',');

function resolveCorsOrigin(request: Request, env: Env): string {
  const requestOrigin = request.headers.get('Origin');
  if (!requestOrigin) return env.ALLOWED_ORIGIN || '*';

  if (env.ALLOWED_ORIGIN && env.ALLOWED_ORIGIN !== '*') {
    const allowed = env.ALLOWED_ORIGIN.split(',').map((s) => s.trim());
    if (allowed.includes(requestOrigin) || allowed.includes('*')) {
      return requestOrigin;
    }
    return allowed[0] || '*';
  }

  // Mirror incoming origin for localhost / portfolio clients so credentialed
  // requests (e.g. navigator.sendBeacon) pass CORS without wildcard rejection
  return requestOrigin;
}

function corsHeaders(origin: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (origin !== '*') {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  return headers;
}

function jsonResponse(
  body: unknown,
  status: number,
  origin: string,
  extra: Record<string, string> = {},
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders(origin),
      ...extra,
    },
  });
}

function isBotRequest(request: Request): boolean {
  const ua = (request.headers.get('user-agent') || '').toLowerCase();
  if (
    !ua ||
    /bot|crawl|spider|googlebot|bingbot|yandexbot|baiduspider|facebookexternalhit|whatsapp|telegrambot|twitterbot|discordbot|slackbot|curl|wget|python|bytespider|gptbot|claudebot|perplexity/i.test(
      ua,
    )
  ) {
    return true;
  }
  const cf = (request as unknown as { cf?: { botManagement?: { score?: number } } }).cf;
  if (cf?.botManagement?.score !== undefined && cf.botManagement.score < 30) {
    return true;
  }
  return false;
}

const REDIS_KEY = 'portfolio_live_viewers';
const TTL_MS = 25_000; // 25 seconds heartbeat TTL

async function callUpstashPipeline(
  env: Env,
  commands: Array<Array<string | number>>,
): Promise<Array<{ result?: unknown; error?: string }> | null> {
  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  try {
    const cleanUrl = env.UPSTASH_REDIS_REST_URL.replace(/\/+$/, '');
    const res = await fetch(`${cleanUrl}/pipeline`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commands),
    });
    if (!res.ok) {
      console.warn(`Upstash pipeline error status: ${res.status}`);
      return null;
    }
    return (await res.json()) as Array<{ result?: unknown; error?: string }>;
  } catch (err) {
    console.warn('Upstash pipeline fetch failed:', err);
    return null;
  }
}

interface WorkerLiveViewer {
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  browser: string;
  os: string;
  device: string;
  currentSection: string;
  isp?: string;
  lastSeen: number;
}

const activeViewers = new Map<string, WorkerLiveViewer>();
const activeReactions = new Map<string, Set<string>>();
let inMemoryTotalVisits = 1;
const inMemoryUniqueVisitors = new Set<string>();

// ── Community Chat In-Memory Fallback & Moderation ───────────────────────────
const CHAT_BAD_LOOSE = [
  "fuck", "motherfuck", "shit", "bullshit", "bitch", "asshole", "cunt", "faggot", "nigger", "nigga",
  "dickhead", "jackass", "dumbass", "cocksuck", "dipshit", "putangina", "putanginamo", "tangina",
  "taena", "tarantado", "gago", "gaga", "ulol", "kingina", "kupal", "pakshet", "pakyu", "hinayupak",
  "hindot", "hindut", "buwiset", "bwisit", "putang ina", "tang ina", "walang hiya", "hayop ka", "gunggong"
];
const CHAT_BAD_STRICT = [
  "ass", "dick", "cock", "prick", "slut", "whore", "twat", "wank", "piss", "bastard", "pussy",
  "puta", "tanga", "bobo", "tite", "titi", "puki", "pekpek", "jakol", "leche", "peste", "lintik", "ungas", "inutil"
];
const CHAT_LINK_TLDS = [
  "com", "net", "org", "io", "co", "dev", "app", "ai", "xyz", "info", "biz", "link", "site", "online",
  "store", "shop", "page", "live", "tech", "cloud", "click", "me", "ly", "gg", "gl", "be", "to", "tv",
  "fm", "sh", "cc", "ws", "ph", "uk", "ca", "au", "de", "jp", "eu", "edu", "gov", "top", "vip", "pro", "fun", "icu"
];

const CHAT_BULLY_WORDS = [
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
];

function isChatOffensive(text: string): boolean {
  if (!text) return false;
  const t = text.normalize('NFC').toLowerCase();
  const collapsed = t.replace(/[^a-z0-9]/g, '');

  for (const b of CHAT_BULLY_WORDS) {
    if (t.includes(b)) return true;
    const collapsedB = b.replace(/[^a-z0-9]/g, '');
    if (collapsedB && collapsed.includes(collapsedB)) return true;
  }

  for (const w of CHAT_BAD_LOOSE) {
    if (t.includes(w)) return true;
  }
  for (const w of CHAT_BAD_STRICT) {
    try {
      if (new RegExp(`\\b${w.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'u').test(t)) return true;
    } catch (e) {
      void e;
    }
  }
  return false;
}

function chatContainsLink(text: string): boolean {
  const t = (text || '').toLowerCase();
  if (/https?:\/\//.test(t)) return true;
  if (/(?:^|[^a-z0-9])www\.[a-z0-9]/.test(t)) return true;
  try {
    return new RegExp(`[a-z0-9][a-z0-9-]*\\.(?:${CHAT_LINK_TLDS.join('|')})\\b`).test(t);
  } catch {
    return false;
  }
}

interface InMemoryChatMessage {
  id: number;
  client_id: string;
  name: string;
  message: string;
  location?: string;
  device?: string;
  verified?: boolean;
  at: string;
}

const inMemoryChatMessages: InMemoryChatMessage[] = [];
let nextInMemoryChatId = 1;
const inMemoryChatIdentities = new Map<string, string>();
const chatCooldowns = new Map<string, number>();

// ── Worker entry ─────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = resolveCorsOrigin(request, env);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);

    const isPosts = url.pathname === '/api/facebook-posts';
    const isPhotos = url.pathname === '/api/facebook-photos';
    const isViewers = url.pathname === '/api/viewers';
    const isViewerLeave = url.pathname === '/api/viewers/leave';
    const isGeo = url.pathname === '/api/geo';
    const isGithubRepos = url.pathname === '/api/github/repos';
    const isGithubContrib = url.pathname === '/api/github/contributions';
    const isGithubUser = url.pathname === '/api/github/user';
    const isGithubGists = url.pathname === '/api/github/gists';
    const isGithubReadme = url.pathname === '/api/github/readme' || url.pathname === '/api/github/raw';
    const isGithubAsset = url.pathname === '/api/github/asset';
    const isRecommendations = url.pathname === '/api/recommendations';
    const isReactions = url.pathname === '/api/reactions';
    const isChat = url.pathname === '/api/chat';
    const isChatIdentity = url.pathname === '/api/chat/identity';
    const isChatDetail = url.pathname.startsWith('/api/chat/') && url.pathname !== '/api/chat/identity';

    // ── Geolocation Endpoint (Zero-Latency Native Cloudflare Edge Geo) ──────
    if (isGeo) {
      const cf = (request as unknown as { cf?: { city?: string; country?: string; region?: string } }).cf;
      const countryCode = (cf?.country || 'PH').toUpperCase();
      const city = cf?.city || 'Manila';
      const country = cf?.country || 'Philippines';
      return jsonResponse({
        success: true,
        city,
        country,
        countryCode,
      }, 200, origin);
    }

    // ── Instant Leave Beacon / Disconnect Endpoint ─────────────────────────
    if (isViewerLeave) {
      let visitorId = '';
      try {
        const text = await request.text();
        if (text) {
          const parsed = JSON.parse(text) as { id?: string };
          visitorId = parsed.id || '';
        }
      } catch {
        // ignore parse error
      }

      if (visitorId) {
        // 1. Remove from Upstash Redis if configured
        const now = Date.now();
        const pipelineRes = await callUpstashPipeline(env, [
          ['ZREM', REDIS_KEY, visitorId],
          ['ZREMRANGEBYSCORE', REDIS_KEY, '-inf', now - TTL_MS],
          ['ZCARD', REDIS_KEY],
        ]);

        if (pipelineRes && pipelineRes[2]?.result !== undefined) {
          const count = Math.max(0, Number(pipelineRes[2].result) || 0);
          return jsonResponse({ success: true, count, isUpstash: true }, 200, origin);
        }

        // Fallback: remove from local memory
        activeViewers.delete(visitorId);
      }

      return jsonResponse({ success: true, count: activeViewers.size }, 200, origin);
    }

    // ── Live Viewers Endpoint (Upstash Redis Global Sliding Window) ────────
    if (isViewers) {
      const now = Date.now();

      // Filter automated crawlers & scrapers
      if (isBotRequest(request)) {
        return jsonResponse({ success: true, count: 1, isBot: true }, 200, origin);
      }

      if (request.method === 'POST') {
        let body: {
          id?: string;
          name?: string;
          city?: string;
          country?: string;
          countryCode?: string;
          browser?: string;
          os?: string;
          device?: string;
          currentSection?: string;
          isp?: string;
          isNewVisit?: boolean;
        } = {};

        try {
          const rawText = await request.text();
          if (rawText) body = JSON.parse(rawText);
        } catch {
          // ignore parse error
        }

        const visitorId = body.id;

        if (visitorId) {
          // 1. Upstash Redis Global Sliding Window & All-Time Visits Tracking
          const commands: Array<Array<string | number>> = [
            ['ZADD', REDIS_KEY, now, visitorId],
            ['ZREMRANGEBYSCORE', REDIS_KEY, '-inf', now - TTL_MS],
            ['ZCARD', REDIS_KEY],
          ];

          if (body.isNewVisit) {
            commands.push(['INCR', 'portfolio_total_visits']);
            commands.push(['PFADD', 'portfolio_unique_visitors', visitorId]);
          } else {
            commands.push(['GET', 'portfolio_total_visits']);
          }
          commands.push(['PFCOUNT', 'portfolio_unique_visitors']);

          const pipelineRes = await callUpstashPipeline(env, commands);

          if (pipelineRes && pipelineRes[2]?.result !== undefined) {
            const count = Math.max(1, Number(pipelineRes[2].result) || 1);
            const totalVisits = Math.max(1, Number(pipelineRes[3]?.result) || 1);
            const totalVisitors = Math.max(1, Number(pipelineRes[pipelineRes.length - 1]?.result) || 1);

            // Optional D1 Database analytics persistence sync
            const db = env.DB || env.portfolio_db;
            if (db && body.isNewVisit) {
              try {
                await db
                  .prepare(
                    `INSERT INTO portfolio_analytics (key, value) VALUES ('total_visits', 1)
                     ON CONFLICT(key) DO UPDATE SET value = value + 1`,
                  )
                  .run();
              } catch {
                // table might not be migrated yet, gracefully ignore
              }
            }

            return jsonResponse(
              {
                success: true,
                count,
                totalVisits,
                totalVisitors,
                isUpstash: true,
              },
              200,
              origin,
            );
          }

          // Fallback: Local isolate Map when Upstash is not configured
          const cf = (request as unknown as { cf?: Record<string, string> }).cf;
          const city = cf?.city || body.city || 'Manila';
          const country = cf?.country || body.country || 'Philippines';
          const countryCode = cf?.country || body.countryCode || 'PH';
          const isp = cf?.asOrganization || body.isp || '';

          // Purge stale local entries (> 25s)
          for (const [id, viewer] of activeViewers.entries()) {
            if (now - viewer.lastSeen > TTL_MS) {
              activeViewers.delete(id);
            }
          }

          if (body.isNewVisit) {
            inMemoryTotalVisits++;
          }
          inMemoryUniqueVisitors.add(visitorId);

          activeViewers.set(visitorId, {
            id: visitorId,
            name: body.name || `Visitor #${visitorId.slice(-4).toUpperCase()}`,
            city,
            country,
            countryCode,
            browser: body.browser || 'Browser',
            os: body.os || 'Desktop',
            device: body.device || 'desktop',
            currentSection: body.currentSection || 'Overview',
            isp,
            lastSeen: now,
          });

          return jsonResponse(
            {
              success: true,
              count: Math.max(1, activeViewers.size),
              totalVisits: Math.max(1, inMemoryTotalVisits),
              totalVisitors: Math.max(1, inMemoryUniqueVisitors.size),
              isUpstash: false,
            },
            200,
            origin,
          );
        }
      }

      // GET method or read-only count query
      const pipelineRes = await callUpstashPipeline(env, [
        ['ZREMRANGEBYSCORE', REDIS_KEY, '-inf', now - TTL_MS],
        ['ZCARD', REDIS_KEY],
        ['GET', 'portfolio_total_visits'],
        ['PFCOUNT', 'portfolio_unique_visitors'],
      ]);

      if (pipelineRes && pipelineRes[1]?.result !== undefined) {
        const count = Math.max(1, Number(pipelineRes[1].result) || 1);
        const totalVisits = Math.max(1, Number(pipelineRes[2]?.result) || 1);
        const totalVisitors = Math.max(1, Number(pipelineRes[3]?.result) || 1);
        return jsonResponse(
          {
            success: true,
            count,
            totalVisits,
            totalVisitors,
            isUpstash: true,
          },
          200,
          origin,
        );
      }

      // Purge local
      for (const [id, viewer] of activeViewers.entries()) {
        if (now - viewer.lastSeen > TTL_MS) {
          activeViewers.delete(id);
        }
      }

      return jsonResponse(
        {
          success: true,
          count: Math.max(1, activeViewers.size),
          totalVisits: Math.max(1, inMemoryTotalVisits),
          totalVisitors: Math.max(1, inMemoryUniqueVisitors.size),
          isUpstash: false,
        },
        200,
        origin,
      );
    }

    // ── GitHub REST & Contributions API Endpoints ─────────────────────────
    if (isGithubRepos || isGithubContrib || isGithubUser || isGithubGists || isGithubReadme || isGithubAsset) {
      if (request.method !== 'GET') {
        return jsonResponse({ error: 'Method Not Allowed' }, 405, origin);
      }

      // Check Cloudflare Edge Cache
      const cache = caches.default;
      const cacheKey = new Request(url.toString(), { method: 'GET' });
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        const headers = new Headers(cachedResponse.headers);
        for (const [k, v] of Object.entries(corsHeaders(origin))) {
          headers.set(k, v);
        }
        headers.set('X-Cache', 'HIT');
        return new Response(cachedResponse.body, { status: cachedResponse.status, headers });
      }

      const ghHeaders: Record<string, string> = {
        'User-Agent': 'Cloudflare-Worker-Portfolio-Proxy/1.0',
        Accept: 'application/vnd.github.v3+json',
      };
      if (env.GITHUB_TOKEN) {
        ghHeaders.Authorization = `Bearer ${env.GITHUB_TOKEN.trim()}`;
      }

      try {
        if (isGithubRepos) {
          const username = url.searchParams.get('username') || 'joshuapalero';
          const perPage = Math.min(Number(url.searchParams.get('per_page')) || 100, 100);
          const sort = url.searchParams.get('sort') || 'pushed';
          const direction = url.searchParams.get('direction') || 'desc';

          const targetUrl = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&sort=${encodeURIComponent(sort)}&direction=${encodeURIComponent(direction)}`;
          const ghRes = await fetch(targetUrl, { headers: ghHeaders });
          const data = await ghRes.text();

          if (!ghRes.ok) {
            const errorHeaders = {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=60, s-maxage=60',
              ...corsHeaders(origin),
              'X-Cache': 'MISS',
            };
            const errRes = new Response(JSON.stringify({ error: `GitHub API error: ${ghRes.status}`, details: data }), { status: ghRes.status, headers: errorHeaders });
            await cache.put(cacheKey, errRes.clone());
            return errRes;
          }

          const responseHeaders = {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=300, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=86400`,
            ...corsHeaders(origin),
            'X-Cache': 'MISS',
          };
          const response = new Response(data, { status: 200, headers: responseHeaders });
          await cache.put(cacheKey, response.clone());
          return response;
        }

        if (isGithubContrib) {
          const username = url.searchParams.get('username') || 'joshuapalero';
          const targetUrl = `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}`;
          const contribRes = await fetch(targetUrl, {
            headers: {
              'User-Agent': 'Cloudflare-Worker-Portfolio-Proxy/1.0',
              Accept: 'application/json',
            },
          });
          const data = await contribRes.text();

          if (!contribRes.ok) {
            const errorHeaders = {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=60, s-maxage=60',
              ...corsHeaders(origin),
              'X-Cache': 'MISS',
            };
            const errRes = new Response(JSON.stringify({ error: `Contributions API error: ${contribRes.status}` }), { status: contribRes.status, headers: errorHeaders });
            await cache.put(cacheKey, errRes.clone());
            return errRes;
          }

          const responseHeaders = {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=600, s-maxage=3600, stale-while-revalidate=86400`,
            ...corsHeaders(origin),
            'X-Cache': 'MISS',
          };
          const response = new Response(data, { status: 200, headers: responseHeaders });
          await cache.put(cacheKey, response.clone());
          return response;
        }

        if (isGithubUser) {
          const username = url.searchParams.get('username') || 'joshuapalero';
          const targetUrl = `https://api.github.com/users/${encodeURIComponent(username)}`;
          const userRes = await fetch(targetUrl, { headers: ghHeaders });
          const data = await userRes.text();

          if (!userRes.ok) {
            const errorHeaders = {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=60, s-maxage=60',
              ...corsHeaders(origin),
              'X-Cache': 'MISS',
            };
            const errRes = new Response(JSON.stringify({ error: `GitHub API error: ${userRes.status}`, details: data }), { status: userRes.status, headers: errorHeaders });
            await cache.put(cacheKey, errRes.clone());
            return errRes;
          }

          const responseHeaders = {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=300, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=86400`,
            ...corsHeaders(origin),
            'X-Cache': 'MISS',
          };
          const response = new Response(data, { status: 200, headers: responseHeaders });
          await cache.put(cacheKey, response.clone());
          return response;
        }

        if (isGithubGists) {
          const username = url.searchParams.get('username') || 'joshuapalero';
          const targetUrl = `https://api.github.com/users/${encodeURIComponent(username)}/gists`;
          const gistRes = await fetch(targetUrl, { headers: ghHeaders });
          const data = await gistRes.text();

          if (!gistRes.ok) {
            const errorHeaders = {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=60, s-maxage=60',
              ...corsHeaders(origin),
              'X-Cache': 'MISS',
            };
            const errRes = new Response(JSON.stringify({ error: `GitHub API error: ${gistRes.status}`, details: data }), { status: gistRes.status, headers: errorHeaders });
            await cache.put(cacheKey, errRes.clone());
            return errRes;
          }

          const responseHeaders = {
            'Content-Type': 'application/json',
            'Cache-Control': `public, max-age=300, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=86400`,
            ...corsHeaders(origin),
            'X-Cache': 'MISS',
          };
          const response = new Response(data, { status: 200, headers: responseHeaders });
          await cache.put(cacheKey, response.clone());
          return response;
        }

        if (isGithubReadme) {
          const username = url.searchParams.get('username') || 'joshuapalero';
          const repo = url.searchParams.get('repo');
          const path = url.searchParams.get('path');

          if (!repo) {
            return jsonResponse({ error: 'Missing repo parameter' }, 400, origin);
          }

          const targetUrl = path
            ? `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/contents/${encodeURIComponent(path)}`
            : `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo)}/readme`;

          const rawHeaders: Record<string, string> = {
            'User-Agent': 'Cloudflare-Worker-Portfolio-Proxy/1.0',
            Accept: 'application/vnd.github.raw',
          };
          if (env.GITHUB_TOKEN) {
            rawHeaders.Authorization = `Bearer ${env.GITHUB_TOKEN.trim()}`;
          }

          const rawRes = await fetch(targetUrl, { headers: rawHeaders });
          const rawText = await rawRes.text();

          if (!rawRes.ok) {
            const errorHeaders = {
              'Content-Type': 'application/json',
              'Cache-Control': 'public, max-age=60, s-maxage=60',
              ...corsHeaders(origin),
              'X-Cache': 'MISS',
            };
            const errRes = new Response(JSON.stringify({ error: `GitHub API error: ${rawRes.status}`, details: rawText }), { status: rawRes.status, headers: errorHeaders });
            await cache.put(cacheKey, errRes.clone());
            return errRes;
          }

          const responseHeaders = {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': `public, max-age=300, s-maxage=${CACHE_TTL_SECONDS}, stale-while-revalidate=86400`,
            ...corsHeaders(origin),
            'X-Cache': 'MISS',
          };
          const response = new Response(rawText, { status: 200, headers: responseHeaders });
          await cache.put(cacheKey, response.clone());
          return response;
        }

        if (isGithubAsset) {
          const assetUrl = url.searchParams.get('url');
          if (!assetUrl) {
            return jsonResponse({ error: 'Missing url parameter' }, 400, origin);
          }

          let parsedAssetUrl: URL;
          try {
            parsedAssetUrl = new URL(assetUrl);
          } catch {
            return jsonResponse({ error: 'Invalid URL parameter' }, 400, origin);
          }

          const allowedHosts = [
            'github.com',
            'user-attachments.githubusercontent.com',
            'raw.githubusercontent.com',
            'avatars.githubusercontent.com',
          ];

          if (!allowedHosts.some((h) => parsedAssetUrl.hostname === h || parsedAssetUrl.hostname.endsWith('.' + h))) {
            return jsonResponse({ error: 'Host not allowed' }, 403, origin);
          }

          const assetHeaders: Record<string, string> = {
            'User-Agent': 'Cloudflare-Worker-Portfolio-Proxy/1.0',
          };
          if (env.GITHUB_TOKEN && parsedAssetUrl.hostname === 'github.com') {
            assetHeaders.Authorization = `Bearer ${env.GITHUB_TOKEN.trim()}`;
          }

          // Fetch GitHub with Authorization header, but with manual redirect
          // so the Authorization header is NOT forwarded to S3 (which causes S3 400 Bad Request)
          let assetRes = await fetch(parsedAssetUrl.toString(), {
            headers: assetHeaders,
            redirect: 'manual',
          });

          if ([301, 302, 307, 308].includes(assetRes.status)) {
            const redirectLocation = assetRes.headers.get('Location');
            if (redirectLocation) {
              assetRes = await fetch(redirectLocation, {
                headers: {
                  'User-Agent': 'Cloudflare-Worker-Portfolio-Proxy/1.0',
                },
              });
            }
          }

          if (!assetRes.ok) {
            return jsonResponse({ error: `Asset upstream error: ${assetRes.status}` }, assetRes.status, origin);
          }

          const contentType = assetRes.headers.get('content-type') || 'image/jpeg';
          const responseHeaders = {
            'Content-Type': contentType,
            'Cache-Control': `public, max-age=3600, s-maxage=${CACHE_TTL_SECONDS * 2}, stale-while-revalidate=86400`,
            ...corsHeaders(origin),
            'X-Cache': 'MISS',
          };

          const response = new Response(assetRes.body, { status: 200, headers: responseHeaders });
          await cache.put(cacheKey, response.clone());
          return response;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Internal Server Error';
        return jsonResponse({ error: message }, 500, origin);
      }
    }

    // ── Recommendations & Peer Endorsements Endpoint (Cloudflare D1) ─────
    if (isRecommendations) {
      const db = env.DB || env.portfolio_db;
      if (!db) {
        // Safe fallback shield: DB binding is not active or configured yet
        return jsonResponse(
          {
            success: false,
            error: 'D1 Database binding is not configured.',
            fallback: true,
            data: [],
          },
          200,
          origin,
        );
      }

      // Handle GET: Retrieve live recommendations
      if (request.method === 'GET') {
        try {
          // Idempotent table check (ensures table exists without crashing)
          await db.prepare(
            `CREATE TABLE IF NOT EXISTS recommendations (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              role TEXT DEFAULT '',
              description TEXT NOT NULL,
              date TEXT NOT NULL,
              created_at INTEGER NOT NULL
            );`
          ).run();

          const result = await db.prepare(
            `SELECT id, name, role, description, date, created_at as createdAt 
             FROM recommendations 
             ORDER BY created_at DESC 
             LIMIT 100`
          ).all();

          return jsonResponse(
            {
              success: true,
              data: result.results ?? [],
              count: result.results?.length ?? 0,
            },
            200,
            origin,
            { 'Cache-Control': 'public, max-age=60, s-maxage=60' },
          );
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Database query failed';
          console.error('[D1 Recommendations] Query error:', message);
          return jsonResponse({ success: false, error: message, data: [] }, 500, origin);
        }
      }

      // Handle POST: Create a new recommendation
      if (request.method === 'POST') {
        // 1. Bot & scraper protection
        if (isBotRequest(request)) {
          return jsonResponse({ success: false, error: 'Automated submissions rejected' }, 403, origin);
        }

        try {
          const rawText = await request.text();
          if (!rawText) {
            return jsonResponse({ success: false, error: 'Empty request body' }, 400, origin);
          }

          const body = JSON.parse(rawText) as {
            id?: string;
            name?: string;
            role?: string;
            description?: string;
            date?: string;
            createdAt?: number;
          };

          const name = (body.name || '').trim();
          const role = (body.role || '').trim();
          const description = (body.description || '').trim();
          const date =
            (body.date || '').trim() ||
            new Intl.DateTimeFormat('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }).format(new Date());
          const createdAt =
            typeof body.createdAt === 'number' && body.createdAt > 0 ? body.createdAt : Date.now();
          const id = body.id?.trim() || `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

          // 2. Strict defensive validation
          const nameParts = name.split(/\s+/).filter(Boolean);
          if (name.length < 2 || name.length > 60 || nameParts.length < 2) {
            return jsonResponse(
              {
                success: false,
                error: 'Please enter your full complete name (first and last name).',
              },
              400,
              origin,
            );
          }
          if (role.length > 120) {
            return jsonResponse(
              { success: false, error: 'Role cannot exceed 120 characters.' },
              400,
              origin,
            );
          }
          if (description.length < 5 || description.length > 50000) {
            return jsonResponse(
              { success: false, error: 'Comment must be between 5 and 50,000 characters (max 5,000 words).' },
              400,
              origin,
            );
          }

          // Anti-impersonation: protect owner identity in recommendations
          const authHeader = request.headers.get('Authorization') || request.headers.get('X-Admin-Token') || '';
          const adminToken = authHeader.replace(/^Bearer\s+/i, '').trim();
          const expectedSecret = (env.CHAT_ADMIN_PASSWORD || env.GITHUB_TOKEN || '').trim();
          const isAuthorizedAdmin = Boolean(expectedSecret && adminToken === expectedSecret);

          const cleanNormalizedName = name.toLowerCase().replace(/\s+/g, ' ');
          const isReserved = [
            'joshua palero',
            'joshua',
            'palero',
            'admin',
            'administrator',
            'portfolio owner',
            'system',
            'moderator',
          ].some((r) => cleanNormalizedName === r || cleanNormalizedName.startsWith(`${r} `));

          if (isReserved && !isAuthorizedAdmin) {
            return jsonResponse(
              {
                success: false,
                error: 'This name is reserved for the portfolio owner and cannot be used for endorsements.',
              },
              403,
              origin,
            );
          }

          // Bully words & profanity validation
          if (isChatOffensive(name) || isChatOffensive(role) || isChatOffensive(description)) {
            return jsonResponse(
              {
                success: false,
                error: "Inappropriate, abusive, or harassment language detected in recommendation. Let's keep it kind.",
              },
              422,
              origin,
            );
          }

          // Links and URLs prohibition in recommendations
          if (chatContainsLink(name) || chatContainsLink(role) || chatContainsLink(description)) {
            return jsonResponse(
              {
                success: false,
                error: 'Links and URLs are not permitted in recommendations.',
              },
              422,
              origin,
            );
          }

          // 3. Ensure table exists (idempotent self-healing)
          await db.prepare(
            `CREATE TABLE IF NOT EXISTS recommendations (
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              role TEXT DEFAULT '',
              description TEXT NOT NULL,
              date TEXT NOT NULL,
              created_at INTEGER NOT NULL
            );`
          ).run();

          // 4. Parameterized insert (100% immune to SQL injection)
          await db.prepare(
            `INSERT INTO recommendations (id, name, role, description, date, created_at)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
            .bind(id, name, role, description, date, createdAt)
            .run();

          const createdRecord = {
            id,
            name,
            role,
            description,
            date,
            createdAt,
          };

          return jsonResponse(
            {
              success: true,
              message: 'Recommendation created successfully',
              data: createdRecord,
            },
            201,
            origin,
          );
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Failed to save recommendation';
          console.error('[D1 Recommendations] Insert error:', message);
          return jsonResponse({ success: false, error: message }, 500, origin);
        }
      }

      return jsonResponse({ success: false, error: 'Method Not Allowed' }, 405, origin);
    }

    // ── Dynamic Portfolio Reactions (Upstash Redis Set per Section) ───────
    if (isReactions) {
      const section = url.searchParams.get('section') || 'profile';
      const redisSetKey = `portfolio_reactions:${section}:likes`;

      if (request.method === 'GET') {
        const visitorId = url.searchParams.get('visitorId') || '';

        // Upstash Redis query
        const pipelineRes = await callUpstashPipeline(env, [
          ['SCARD', redisSetKey],
          ['SISMEMBER', redisSetKey, visitorId],
        ]);

        if (pipelineRes && pipelineRes[0]?.result !== undefined) {
          const count = Number(pipelineRes[0].result) || 0;
          const userLiked = Boolean(pipelineRes[1]?.result);
          return jsonResponse({ success: true, count, userLiked }, 200, origin, {
            'Cache-Control': 'public, max-age=5, s-maxage=5',
          });
        }

        // In-memory fallback if Upstash is not configured
        const sectionSet = activeReactions.get(section) || new Set<string>();
        return jsonResponse(
          { success: true, count: sectionSet.size, userLiked: visitorId ? sectionSet.has(visitorId) : false },
          200,
          origin,
        );
      }

      if (request.method === 'POST') {
        let body: { section?: string; visitorId?: string; action?: 'like' | 'unlike' } = {};
        try {
          const text = await request.text();
          if (text) body = JSON.parse(text);
        } catch {
          // ignore
        }

        const visitorId = body.visitorId?.trim() || '';
        const action = body.action || 'like';

        if (!visitorId) {
          return jsonResponse({ success: false, error: 'visitorId required' }, 400, origin);
        }

        if (action === 'unlike') {
          const pipelineRes = await callUpstashPipeline(env, [
            ['SREM', redisSetKey, visitorId],
            ['SCARD', redisSetKey],
          ]);

          if (pipelineRes && pipelineRes[1]?.result !== undefined) {
            const count = Number(pipelineRes[1].result) || 0;
            return jsonResponse({ success: true, count, userLiked: false }, 200, origin);
          }

          const sectionSet = activeReactions.get(section);
          if (sectionSet) sectionSet.delete(visitorId);
          return jsonResponse({ success: true, count: sectionSet ? sectionSet.size : 0, userLiked: false }, 200, origin);
        } else {
          const pipelineRes = await callUpstashPipeline(env, [
            ['SADD', redisSetKey, visitorId],
            ['SCARD', redisSetKey],
          ]);

          if (pipelineRes && pipelineRes[1]?.result !== undefined) {
            const count = Number(pipelineRes[1].result) || 0;
            return jsonResponse({ success: true, count, userLiked: true }, 200, origin);
          }

          let sectionSet = activeReactions.get(section);
          if (!sectionSet) {
            sectionSet = new Set<string>();
            activeReactions.set(section, sectionSet);
          }
          sectionSet.add(visitorId);
          return jsonResponse({ success: true, count: sectionSet.size, userLiked: true }, 200, origin);
        }
      }

      return jsonResponse({ success: false, error: 'Method Not Allowed' }, 405, origin);
    }

    // ── Community Chat Endpoints (100% Free - Cloudflare D1 + Memory Fallback) ──
    if (isChat) {
      const db = env.DB || env.portfolio_db;

      if (request.method === 'GET') {
        const after = Number(url.searchParams.get('after')) || 0;

        if (db) {
          try {
            await db.prepare(`
              CREATE TABLE IF NOT EXISTS community_chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id TEXT NOT NULL,
                name TEXT NOT NULL,
                message TEXT NOT NULL,
                location TEXT DEFAULT '',
                device TEXT DEFAULT '',
                verified INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
              );
            `).run();

            const countRes = await db.prepare('SELECT COUNT(*) as total FROM community_chat_messages').first<{ total: number }>();
            const total = countRes?.total ?? 0;

            let rows: Array<Record<string, unknown>> = [];
            if (after > 0) {
              const res = await db.prepare(
                'SELECT * FROM community_chat_messages WHERE id > ? ORDER BY id ASC LIMIT 60'
              ).bind(after).all();
              rows = (res.results as Array<Record<string, unknown>>) || [];
            } else {
              const res = await db.prepare(
                'SELECT * FROM community_chat_messages ORDER BY id DESC LIMIT 60'
              ).all();
              rows = ((res.results as Array<Record<string, unknown>>) || []).reverse();
            }

            const messages = rows.map((r) => ({
              id: Number(r.id),
              client_id: String(r.client_id || ''),
              name: String(r.name || ''),
              message: String(r.message || ''),
              location: r.location ? String(r.location) : undefined,
              device: r.device ? String(r.device) : undefined,
              verified: Boolean(r.verified),
              at: String(r.created_at || new Date().toISOString()),
            }));

            return jsonResponse({ success: true, total, messages }, 200, origin, {
              'Cache-Control': 'no-store',
            });
          } catch (err) {
            console.warn('[D1 Chat] Error reading messages, using fallback:', err);
          }
        }

        // In-Memory Fallback
        const filtered = after > 0
          ? inMemoryChatMessages.filter((m) => m.id > after).slice(0, 60)
          : inMemoryChatMessages.slice(-60);

        return jsonResponse(
          { success: true, total: inMemoryChatMessages.length, messages: filtered },
          200,
          origin,
          { 'Cache-Control': 'no-store' }
        );
      }

      if (request.method === 'POST') {
        let body: {
          name?: string;
          message?: string;
          client_id?: string;
          location?: string;
          device?: string;
          verified?: boolean;
        } = {};
        try {
          const text = await request.text();
          if (text) body = JSON.parse(text);
        } catch {
          return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400, origin);
        }

        const clientId = (body.client_id || '').trim();
        const name = (body.name || '').trim();
        const message = (body.message || '').trim();
        const device = (body.device || '').trim();

        if (!clientId || !name || !message) {
          return jsonResponse({ success: false, error: 'Name, message, and client_id are required' }, 400, origin);
        }

        if (name.length > 40) {
          return jsonResponse({ success: false, error: 'Name cannot exceed 40 characters' }, 400, origin);
        }

        if (message.length > 500) {
          return jsonResponse({ success: false, error: 'Message cannot exceed 500 characters' }, 400, origin);
        }

        // Location auto-detection from Cloudflare Edge if not supplied
        const cf = (request as unknown as { cf?: { city?: string; country?: string } }).cf;
        const autoLoc = [cf?.city, cf?.country].filter(Boolean).join(', ');
        const location = (body.location || '').trim() || autoLoc;

        // Anti-impersonation shield: Protect owner names and verify credentials
        const authHeader = request.headers.get('Authorization') || request.headers.get('X-Admin-Token') || '';
        const adminToken = authHeader.replace(/^Bearer\s+/i, '').trim();
        const expectedSecret = (env.CHAT_ADMIN_PASSWORD || env.GITHUB_TOKEN || '').trim();
        const isAuthorizedAdmin = Boolean(expectedSecret && (adminToken === expectedSecret || (body as { admin_key?: string }).admin_key === expectedSecret));

        // Profanity & Bully Words Filter (authorized admin exempt from owner name check, but messages still checked)
        if ((!isAuthorizedAdmin && isChatOffensive(name)) || isChatOffensive(message)) {
          return jsonResponse(
            { success: false, reason: 'offensive', message: "let's keep it kind" },
            422,
            origin
          );
        }

        if (chatContainsLink(name) || chatContainsLink(message)) {
          return jsonResponse(
            { success: false, reason: 'link', message: "links aren't allowed in chat" },
            422,
            origin
          );
        }

        // Anti-spam Cooldown: 5 seconds (exempt admin)
        const now = Date.now();
        const lastSent = chatCooldowns.get(clientId) || 0;
        if (!isAuthorizedAdmin && now - lastSent < 5000) {
          return jsonResponse(
            { success: false, reason: 'cooldown', message: 'easy — give it a sec…' },
            429,
            origin
          );
        }
        chatCooldowns.set(clientId, now);

        const RESERVED_NAMES = [
          'joshua palero',
          'joshua',
          'palero',
          'admin',
          'administrator',
          'portfolio owner',
          'system',
          'moderator',
        ];

        const cleanNormalizedName = name.toLowerCase().replace(/\s+/g, ' ');
        const isReserved = RESERVED_NAMES.some((r) => cleanNormalizedName === r || cleanNormalizedName.startsWith(`${r} `));

        if (isReserved && !isAuthorizedAdmin) {
          return jsonResponse(
            { success: false, reason: 'reserved_name', error: 'This name is reserved for the portfolio owner' },
            403,
            origin
          );
        }

        const verified = isAuthorizedAdmin;
        const createdAt = new Date().toISOString();

        if (db) {
          try {
            await db.prepare(`
              CREATE TABLE IF NOT EXISTS community_chat_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                client_id TEXT NOT NULL,
                name TEXT NOT NULL,
                message TEXT NOT NULL,
                location TEXT DEFAULT '',
                device TEXT DEFAULT '',
                verified INTEGER DEFAULT 0,
                created_at TEXT NOT NULL
              );
            `).run();

            const insertRes = await db.prepare(`
              INSERT INTO community_chat_messages (client_id, name, message, location, device, verified, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `).bind(clientId, name, message, location, device, verified ? 1 : 0, createdAt).run();

            const newId = Number(insertRes.meta?.last_row_id) || Date.now();

            // Save remembered identity
            try {
              await db.prepare(`
                CREATE TABLE IF NOT EXISTS community_chat_identities (
                  client_id TEXT PRIMARY KEY,
                  name TEXT NOT NULL,
                  updated_at TEXT NOT NULL
                );
              `).run();

              await db.prepare(`
                INSERT INTO community_chat_identities (client_id, name, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(client_id) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at
              `).bind(clientId, name, createdAt).run();
            } catch {
              // ignore identity save error
            }

            const createdMessage = {
              id: newId,
              client_id: clientId,
              name,
              message,
              location: location || undefined,
              device: device || undefined,
              verified,
              at: createdAt,
            };

            return jsonResponse({ success: true, message: createdMessage }, 201, origin);
          } catch (err) {
            console.warn('[D1 Chat] Insert error, falling back to memory:', err);
          }
        }

        // In-Memory Fallback
        const fallbackId = nextInMemoryChatId++;
        const fallbackMessage = {
          id: fallbackId,
          client_id: clientId,
          name,
          message,
          location: location || undefined,
          device: device || undefined,
          verified,
          at: createdAt,
        };
        inMemoryChatMessages.push(fallbackMessage);
        inMemoryChatIdentities.set(clientId, name);

        return jsonResponse({ success: true, message: fallbackMessage }, 201, origin);
      }

      return jsonResponse({ success: false, error: 'Method Not Allowed' }, 405, origin);
    }

    // ── Chat Identity Endpoint (GET / POST) ──────────────────────────────────
    if (isChatIdentity) {
      const db = env.DB || env.portfolio_db;

      if (request.method === 'GET') {
        const clientId = url.searchParams.get('client_id')?.trim();
        if (!clientId) {
          return jsonResponse({ success: false, error: 'client_id is required' }, 400, origin);
        }

        if (db) {
          try {
            const row = await db.prepare('SELECT name FROM community_chat_identities WHERE client_id = ?').bind(clientId).first<{ name: string }>();
            if (row?.name) {
              return jsonResponse({ success: true, name: row.name }, 200, origin);
            }
          } catch {
            // fallback
          }
        }

        const remembered = inMemoryChatIdentities.get(clientId) || '';
        return jsonResponse({ success: true, name: remembered }, 200, origin);
      }

      if (request.method === 'POST') {
        let body: { client_id?: string; name?: string } = {};
        try {
          const text = await request.text();
          if (text) body = JSON.parse(text);
        } catch {
          return jsonResponse({ success: false, error: 'Invalid JSON body' }, 400, origin);
        }

        const clientId = (body.client_id || '').trim();
        const name = (body.name || '').trim();

        if (!clientId || !name) {
          return jsonResponse({ success: false, error: 'client_id and name required' }, 400, origin);
        }

        const authHeader = request.headers.get('Authorization') || request.headers.get('X-Admin-Token') || '';
        const adminToken = authHeader.replace(/^Bearer\s+/i, '').trim();
        const expectedSecret = (env.CHAT_ADMIN_PASSWORD || env.GITHUB_TOKEN || '').trim();
        const isAuthorizedAdmin = Boolean(expectedSecret && adminToken === expectedSecret);

        if (name.length > 40 || chatContainsLink(name) || (!isAuthorizedAdmin && isChatOffensive(name))) {
          return jsonResponse({ success: false, error: 'Invalid name' }, 422, origin);
        }

        const cleanNormalizedName = name.toLowerCase().replace(/\s+/g, ' ');
        const isReserved = [
          'joshua palero',
          'joshua',
          'palero',
          'admin',
          'administrator',
          'portfolio owner',
          'system',
          'moderator',
        ].some((r) => cleanNormalizedName === r || cleanNormalizedName.startsWith(`${r} `));

        if (isReserved && !isAuthorizedAdmin) {
          return jsonResponse({ success: false, error: 'This name is reserved for the portfolio owner' }, 403, origin);
        }

        const updatedAt = new Date().toISOString();
        if (db) {
          try {
            await db.prepare(`
              INSERT INTO community_chat_identities (client_id, name, updated_at)
              VALUES (?, ?, ?)
              ON CONFLICT(client_id) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at
            `).bind(clientId, name, updatedAt).run();
          } catch {
            // fallback
          }
        }

        inMemoryChatIdentities.set(clientId, name);
        return jsonResponse({ success: true, name }, 200, origin);
      }

      return jsonResponse({ success: false, error: 'Method Not Allowed' }, 405, origin);
    }

    // ── Delete Message Endpoint (DELETE /api/chat/:id) ───────────────────────
    if (isChatDetail) {
      if (request.method === 'DELETE') {
        const idStr = url.pathname.replace('/api/chat/', '').trim();
        const messageId = Number(idStr);
        if (!messageId) {
          return jsonResponse({ success: false, error: 'Invalid message ID' }, 400, origin);
        }

        const authHeader = request.headers.get('Authorization') || request.headers.get('X-Admin-Token') || '';
        const adminToken = authHeader.replace(/^Bearer\s+/i, '').trim();
        const expectedSecret = (env.CHAT_ADMIN_PASSWORD || env.GITHUB_TOKEN || '').trim();
        const isAuthorizedAdmin = Boolean(expectedSecret && adminToken === expectedSecret);
        const clientId = url.searchParams.get('client_id')?.trim();

        if (!isAuthorizedAdmin && !clientId) {
          return jsonResponse(
            { success: false, error: 'Unauthorized: Admin authentication or client_id required' },
            401,
            origin
          );
        }

        const db = env.DB || env.portfolio_db;
        if (db) {
          try {
            if (isAuthorizedAdmin) {
              await db.prepare('DELETE FROM community_chat_messages WHERE id = ?').bind(messageId).run();
            } else {
              const res = await db.prepare('DELETE FROM community_chat_messages WHERE id = ? AND client_id = ?').bind(messageId, clientId).run();
              if (res.meta?.changes === 0) {
                return jsonResponse({ success: false, error: 'Message not found or not owned by you' }, 403, origin);
              }
            }
          } catch (err) {
            console.warn('[D1 Chat] Error deleting message:', err);
          }
        }

        const idx = inMemoryChatMessages.findIndex((m) => m.id === messageId && (isAuthorizedAdmin || m.client_id === clientId));
        if (idx !== -1) inMemoryChatMessages.splice(idx, 1);

        return jsonResponse({ success: true, message: 'Message deleted' }, 200, origin);
      }

      return jsonResponse({ success: false, error: 'Method Not Allowed' }, 405, origin);
    }

    if (!isPosts && !isPhotos) {
      return jsonResponse({ success: false, error: 'Not Found' }, 404, origin);
    }

    if (request.method !== 'GET') {
      return jsonResponse({ success: false, error: 'Method Not Allowed' }, 405, origin);
    }

    // Validate env secrets
    if (!env.FB_PAGE_ID || !env.FB_PAGE_ACCESS_TOKEN) {
      return jsonResponse(
        { success: false, error: 'Server misconfigured: missing Facebook credentials' },
        500,
        origin,
      );
    }

    try {
      // ── Check Cloudflare edge cache ──────────────────────────────────────
      const cache = caches.default;
      const cacheKey = new Request(url.toString(), { method: 'GET' });
      const cachedResponse = await cache.match(cacheKey);

      if (cachedResponse) {
        // Re-apply CORS headers (cache may strip them)
        const headers = new Headers(cachedResponse.headers);
        for (const [k, v] of Object.entries(corsHeaders(origin))) {
          headers.set(k, v);
        }
        headers.set('X-Cache', 'HIT');
        return new Response(cachedResponse.body, { status: 200, headers });
      }

      // ── Fetch from Facebook Graph API ────────────────────────────────────
      const limit = Math.min(
        Number(url.searchParams.get('limit')) || DEFAULT_LIMIT,
        100,
      );

      const graphUrl = isPhotos
        ? `https://graph.facebook.com/${GRAPH_API_VERSION}/${env.FB_PAGE_ID}/photos?type=uploaded&fields=id,name,images,picture,created_time,link,place{name,location{city,country}},reactions.summary(true).limit(0),comments.summary(true).limit(0)&limit=${limit}&access_token=${env.FB_PAGE_ACCESS_TOKEN}`
        : `https://graph.facebook.com/${GRAPH_API_VERSION}/${env.FB_PAGE_ID}/posts?fields=${FIELDS}&limit=${limit}&access_token=${env.FB_PAGE_ACCESS_TOKEN}`;

      const fbResponse = await fetch(graphUrl, {
        headers: { Accept: 'application/json' },
      });

      const fbData: GraphApiResponse = await fbResponse.json();

      if (fbData.error) {
        return jsonResponse(
          { success: false, error: fbData.error.message },
          502,
          origin,
        );
      }

      let responseBody: string;

      if (isPhotos) {
        const rawPhotos = (fbData.data ?? []) as FacebookPhotoItem[];
        const sanitizedPhotos = rawPhotos.map((photo) => ({
          id: photo.id,
          caption: photo.name ?? '',
          picture: photo.picture ?? '',
          full_picture: photo.images?.[0]?.source ?? photo.picture ?? '',
          created_time: photo.created_time,
          permalink_url: photo.link ?? '',
          reactions_count: photo.reactions?.summary?.total_count ?? 0,
          comments_count: photo.comments?.summary?.total_count ?? 0,
          place_name: photo.place?.name ?? '',
          place_city: photo.place?.location?.city ?? '',
          place_country: photo.place?.location?.country ?? '',
        }));

        responseBody = JSON.stringify({
          success: true,
          photos: sanitizedPhotos,
          count: sanitizedPhotos.length,
        });
      } else {
        // Sanitize: strip the raw reactions/comments data arrays (we only need summary)
        const rawPosts = (fbData.data ?? []) as FacebookPost[];
        const sanitizedPosts = rawPosts.map((post) => ({
          id: post.id,
          message: post.message ?? '',
          full_picture: post.full_picture ?? null,
          created_time: post.created_time,
          permalink_url: post.permalink_url,
          shares_count: post.shares?.count ?? 0,
          reactions_count: post.reactions?.summary?.total_count ?? 0,
          comments_count: post.comments?.summary?.total_count ?? 0,
          place_name: post.place?.name ?? '',
          place_city: post.place?.location?.city ?? '',
          place_country: post.place?.location?.country ?? '',
          story: post.story ?? '',
        }));

        responseBody = JSON.stringify({
          success: true,
          posts: sanitizedPosts,
          count: sanitizedPosts.length,
        });
      }

      // ── Store in edge cache ──────────────────────────────────────────────
      const cacheHeaders = {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
        ...corsHeaders(origin),
        'X-Cache': 'HIT',
      };

      // We must clone because cache.put() consumes the body
      await cache.put(cacheKey, new Response(responseBody, { headers: cacheHeaders }));

      return new Response(responseBody, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': `public, max-age=${CACHE_TTL_SECONDS}`,
          ...corsHeaders(origin),
          'X-Cache': 'MISS',
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Internal server error';
      return jsonResponse({ success: false, error: message }, 500, origin);
    }
  },
};
