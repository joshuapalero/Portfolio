/**
 * Cloudflare Worker GitHub Proxy Client & Fallback Engine
 *
 * Adheres to Aurora Scharff's resilient data-layer architecture:
 * 1. Checks for configured Cloudflare Worker proxy (`VITE_GITHUB_WORKER_URL` or `VITE_FB_WORKER_URL`).
 * 2. When deployed, queries the edge proxy where responses are cached (30m TTL) and authenticated
 *    via edge secret, shielding visitors from GitHub's 60 req/hr unauthenticated rate limit.
 * 3. In local development without a worker, smoothly falls back to the direct GitHub REST API.
 */

export const DEFAULT_WORKER_URL = 'https://facebook-proxy.joshuapalero.workers.dev';

export function getWorkerBaseUrl(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const url =
      import.meta.env.VITE_GITHUB_WORKER_URL ||
      import.meta.env.VITE_WORKER_URL ||
      import.meta.env.VITE_FB_WORKER_URL;

    if (url && !url.includes('YOUR_SUBDOMAIN')) {
      return url.trim().replace(/\/+$/, '');
    }
  }
  return DEFAULT_WORKER_URL;
}

/**
 * Fetches user repositories either through the Cloudflare edge proxy or direct GitHub API.
 */
export async function fetchReposViaProxyOrDirect<T = unknown>(
  username: string,
  token?: string,
  signal?: AbortSignal
): Promise<T> {
  const workerBase = getWorkerBaseUrl();

  if (workerBase) {
    try {
      const proxyUrl = `${workerBase}/api/github/repos?username=${encodeURIComponent(
        username
      )}&per_page=100&sort=pushed&direction=desc`;
      const res = await fetch(proxyUrl, {
        signal,
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        return (await res.json()) as T;
      }
      console.warn(`[GitHub Proxy] Worker returned status ${res.status}, attempting direct API fallback.`);
    } catch (err) {
      if (signal?.aborted || (err as { name?: string })?.name === 'AbortError') {
        throw err;
      }
      console.warn('[GitHub Proxy] Edge worker request failed, falling back to direct API:', err);
    }
  }

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  // Direct GitHub API fallback
  const directUrl = `https://api.github.com/users/${encodeURIComponent(
    username
  )}/repos?per_page=100&sort=pushed&direction=desc`;

  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(directUrl, { signal, headers });
  if (!res.ok) {
    throw new Error(
      res.status === 403
        ? 'GitHub API rate limit reached (60 req/hr). Deploy the Cloudflare proxy to unlock edge caching & 5,000 req/hr.'
        : res.status === 404
        ? `GitHub user "${username}" not found.`
        : `GitHub API error ${res.status}`
    );
  }

  return (await res.json()) as T;
}

/**
 * Fetches contribution calendar data via Cloudflare Worker proxy or direct jogruber API.
 */
export async function fetchContributionsViaProxyOrDirect<T = unknown>(
  username: string,
  signal?: AbortSignal
): Promise<T> {
  const workerBase = getWorkerBaseUrl();

  if (workerBase) {
    try {
      const proxyUrl = `${workerBase}/api/github/contributions?username=${encodeURIComponent(username)}`;
      const res = await fetch(proxyUrl, { signal });
      if (res.ok) {
        return (await res.json()) as T;
      }
    } catch (err) {
      if (signal?.aborted || (err as { name?: string })?.name === 'AbortError') {
        throw err;
      }
      console.warn('[Contributions Proxy] Worker failed, falling back to direct API:', err);
    }
  }

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const directUrl = `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}`;
  const res = await fetch(directUrl, { signal });
  if (!res.ok) {
    throw new Error(`Contributions API error: ${res.status}`);
  }

  return (await res.json()) as T;
}

/**
 * Fetches user profile data via Cloudflare Worker proxy or direct GitHub API.
 */
export async function fetchUserProfileViaProxyOrDirect<T = unknown>(
  username: string,
  token?: string,
  signal?: AbortSignal
): Promise<T> {
  const workerBase = getWorkerBaseUrl();

  if (workerBase) {
    try {
      const proxyUrl = `${workerBase}/api/github/user?username=${encodeURIComponent(username)}`;
      const res = await fetch(proxyUrl, { signal });
      if (res.ok) {
        return (await res.json()) as T;
      }
    } catch (err) {
      if (signal?.aborted || (err as { name?: string })?.name === 'AbortError') {
        throw err;
      }
      console.warn('[User Profile Proxy] Worker failed, falling back to direct API:', err);
    }
  }

  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const directUrl = `https://api.github.com/users/${encodeURIComponent(username)}`;
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(directUrl, { signal, headers });
  if (!res.ok) {
    throw new Error(`GitHub user profile error: ${res.status}`);
  }

  return (await res.json()) as T;
}

export interface RawFileResult {
  readonly text: string;
  readonly repo: string;
  readonly source: 'worker-proxy' | 'github-raw' | 'jsdelivr' | 'github-api';
}

/**
 * Fetches raw file or README content via direct GitHub multi-tier fallback.
 * Powers Experiences, Certifications, and About/Bio.
 * Fully protects against CORS preflight issues and unauthenticated rate limits.
 */
export async function fetchRawFileViaProxyOrDirect(
  username: string,
  repoCandidates: string[],
  filePaths: string[] = ['README.md'],
  branches: string[] = ['main', 'master'],
  token?: string,
  signal?: AbortSignal
): Promise<RawFileResult | null> {
  if (signal?.aborted) return null;

  // Tier 0: Cloudflare Worker Edge Proxy (Authenticated with GITHUB_TOKEN secret & cached at edge)
  // Stable URL → Cloudflare edge cache can serve up to 30 min TTL from a prior request.
  // `cache: 'no-cache'` in the fetch options sends a `Cache-Control: no-cache` header to the
  // edge, which instructs Cloudflare to *revalidate* — but only from the browser's perspective.
  // The worker's own `caches.default` uses the URL as its cache key, so we keep it stable here.
  const workerBase = getWorkerBaseUrl();
  if (workerBase) {
    for (const repo of repoCandidates) {
      for (const filePath of filePaths) {
        if (signal?.aborted) return null;
        try {
          const isReadme = filePath.toLowerCase() === 'readme.md';
          const proxyUrl = isReadme
            ? `${workerBase}/api/github/readme?username=${encodeURIComponent(username)}&repo=${encodeURIComponent(repo)}`
            : `${workerBase}/api/github/raw?username=${encodeURIComponent(username)}&repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(filePath)}`;

          const res = await fetch(proxyUrl, { signal }).catch(() => null);
          if (res && res.ok) {
            const text = await res.text();
            if (text && text.trim() && !text.includes('404: Not Found') && !text.includes('GitHub API error')) {
              return { text, repo, source: 'worker-proxy' };
            }
          }
        } catch {
          // Continue to next candidate or fallback tiers
        }
      }
    }
  }

  // Tier 1: Direct GitHub Raw CDN (simple CORS request, no preflight, no rate limits)
  for (const repo of repoCandidates) {
    for (const branch of branches) {
      for (const filePath of filePaths) {
        if (signal?.aborted) return null;
        try {
          const url = `https://raw.githubusercontent.com/${encodeURIComponent(
            username
          )}/${encodeURIComponent(repo)}/${branch}/${encodeURIComponent(filePath)}`;
          const res = await fetch(url, { signal, cache: 'no-cache' }).catch(() => null);
          if (res && res.ok) {
            const text = await res.text();
            if (text && text.trim() && !text.includes('404: Not Found')) {
              return { text, repo, source: 'github-raw' };
            }
          }
        } catch {
          // Continue to next candidate
        }
      }
    }
  }

  // Tier 3: jsDelivr Multi-Cloud CDN (independent global fallback)
  for (const repo of repoCandidates) {
    for (const branch of branches) {
      for (const filePath of filePaths) {
        try {
          const url = `https://cdn.jsdelivr.net/gh/${encodeURIComponent(
            username
          )}/${encodeURIComponent(repo)}@${branch}/${encodeURIComponent(filePath)}`;
          const res = await fetch(url, { signal, cache: 'no-cache' }).catch(() => null);
          if (res && res.ok) {
            const text = await res.text();
            if (text && text.trim() && !text.includes('404: Not Found')) {
              return { text, repo, source: 'jsdelivr' };
            }
          }
        } catch {
          // Continue
        }
      }
    }
  }

  // Tier 4: GitHub REST API (CORS-enabled with raw accept header)
  for (const repo of repoCandidates) {
    try {
      const apiHeaders: Record<string, string> = {
        Accept: 'application/vnd.github.raw',
      };
      if (token) {
        apiHeaders.Authorization = `Bearer ${token}`;
      }
      const apiRes = await fetch(
        `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(
          repo
        )}/readme`,
        { headers: apiHeaders, signal, cache: 'no-cache' }
      ).catch(() => null);

      if (apiRes && apiRes.ok) {
        const text = await apiRes.text();
        if (text && text.trim() && !text.includes('404: Not Found')) {
          return { text, repo, source: 'github-api' };
        }
      }
    } catch {
      // Continue
    }
  }

  return null;
}
