import type { BioItem, FetchBioParams } from './types';
import { fetchRawFileViaProxyOrDirect, getWorkerBaseUrl } from '../github_proxy';

/**
 * Strips markdown frontmatter, headings (#, ##), and comments,
 * and extracts body paragraphs directly from the user's repository README.
 */
export function cleanBioMarkdown(raw: string): string {
  let text = raw.trim();

  // Strip YAML frontmatter if present
  if (text.startsWith('---')) {
    const endIdx = text.indexOf('---', 3);
    if (endIdx !== -1) {
      text = text.slice(endIdx + 3).trim();
    }
  }

  // Remove HTML comments <!-- ... -->
  text = text.replace(/<!--[\s\S]*?-->/g, '').trim();

  // Split lines and filter out title headers like "# About Me" or "## Bio"
  const rawLines = text.split(/\r?\n/);
  const contentLines: string[] = [];

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (contentLines.length === 0 && !trimmed) continue;
    // Skip headers like "# About Me" or "## Who Am I"
    if (/^#{1,3}\s+(about(\s+me)?|bio|who\s+i\s+am|profile|introduction)/i.test(trimmed)) {
      continue;
    }
    // Skip standalone "# Title" if at the very beginning
    if (contentLines.length === 0 && /^#+\s+/.test(trimmed)) {
      continue;
    }
    contentLines.push(line);
  }

  return contentLines.join('\n').trim();
}

/**
 * Normalises an image URL extracted from a GitHub README so it is always
 * directly renderable in an <img> src attribute without relying on local public folders.
 *
 * Handles:
 * - Private repository user-attachment URLs: proxied through the Cloudflare Worker
 *   (/api/github/asset?url=...) using the worker's edge-authenticated GITHUB_TOKEN secret.
 * - GitHub blob URLs: converted to raw.githubusercontent.com equivalents.
 * - Relative paths: resolved against raw.githubusercontent.com base.
 * - Any other absolute https:// URL: kept as-is.
 */
export function normaliseImageUrl(
  rawUrl: string,
  username: string,
  repo: string,
  branch: string,
): string {
  const url = rawUrl.replace(/\s+["'][^"']*["']\s*$/, '').trim();

  if (!url) return '';

  // 1. Private repo user-attachments: proxy through Cloudflare Worker with authenticated edge secret
  if (url.includes('github.com/user-attachments/assets/') || url.includes('user-images.githubusercontent.com/')) {
    const workerBase = getWorkerBaseUrl() || 'https://facebook-proxy.joshuapalero.workers.dev';
    return `${workerBase}/api/github/asset?url=${encodeURIComponent(url)}`;
  }

  // 2. Already an absolute URL
  if (/^https?:\/\//i.test(url)) {
    // Convert GitHub blob viewer URL to raw CDN URL so <img> gets the binary
    const blobMatch = url.match(
      /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i,
    );
    if (blobMatch) {
      const [, blobUser, blobRepo, blobBranch, blobPath] = blobMatch;
      return `https://raw.githubusercontent.com/${blobUser}/${blobRepo}/${blobBranch}/${blobPath}`;
    }
    return url;
  }

  // 3. Relative path — resolve against raw.githubusercontent.com at repo root
  const relativePath = url.replace(/^\.\//, '');
  return `https://raw.githubusercontent.com/${username}/${repo}/${branch}/${relativePath}`;
}

/**
 * Fetches live bio documentation exclusively from the user's GitHub repository (About-me).
 * Tries main and master branches across repo casing variations, with JSON support.
 * Never relies on local public folders.
 */
export async function fetchBioFromGithub(params: FetchBioParams = {}): Promise<BioItem> {
  const username = (params.username || 'joshuapalero').trim();
  const repo = (params.repo || 'About-me').trim();
  const token =
    params.token ||
    (typeof import.meta !== 'undefined'
      ? (import.meta.env.VITE_GITHUB_TOKEN as string | undefined)
      : undefined);

  // Candidate repository name variations to support various casing
  const repoCandidates = Array.from(new Set([repo, 'About-me', 'About-Me', 'about-me', 'AboutMe']));
  const branches = ['main', 'master'];

  // 1. Fetch README.md directly across multi-tier fallback (CDN & direct API)
  const fileResult = await fetchRawFileViaProxyOrDirect(
    username,
    repoCandidates,
    ['README.md', 'bio.json', 'about.json', 'README.mdx', 'about.md'],
    branches,
    token,
    params.signal
  );

  if (fileResult && fileResult.text) {
    let rawContent = fileResult.text;
    // If it's bio.json, parse the JSON fields
    if (rawContent.trim().startsWith('{')) {
      try {
        const data = JSON.parse(rawContent);
        const bioContent =
          typeof data === 'string'
            ? data
            : typeof data === 'object' && data !== null
              ? (data.bio || data.about || (Array.isArray(data.lines) ? data.lines.join('\n') : null))
              : null;
        if (bioContent && typeof bioContent === 'string') {
          rawContent = bioContent;
        }
      } catch {
        // use raw text fallback
      }
    }

    let cleaned = cleanBioMarkdown(rawContent);
    const images: string[] = [];
    const resolvedBranch = branches[0];

    /**
     * Extract Markdown images: ![alt](url) or ![alt](url "title")
     */
    cleaned = cleaned.replace(
      /!\[(?:[^\]]*)\]\(\s*((?:[^)"'\s]|\([^)]*\))+)(?:\s+["'][^"']*["'])?\s*\)/g,
      (_match, url: string) => {
        const normalised = normaliseImageUrl(url, username, fileResult.repo, resolvedBranch);
        if (normalised && !images.includes(normalised)) images.push(normalised);
        return '';
      },
    );

    /**
     * Extract HTML images: <img ... />
     */
    cleaned = cleaned.replace(
      /<img\b([^>]*?)\/?>/gi,
      (_match, tagAttributes: string) => {
        const srcMatch = tagAttributes.match(/src=["']([\s\S]*?)["']/i);
        const src = srcMatch ? srcMatch[1].trim() : '';
        if (src) {
          const normalised = normaliseImageUrl(src, username, fileResult.repo, resolvedBranch);
          if (normalised && !images.includes(normalised)) images.push(normalised);
        }
        return '';
      },
    );

    // Clean up excessive empty lines left by image removal
    cleaned = cleaned.replace(/\n\s*\n/g, '\n\n').trim();

    return {
      rawText: cleaned,
      lines: cleaned.split(/\r?\n/).filter(Boolean),
      images,
      source: 'github-repo',
      sourceUrl: `https://github.com/${username}/${fileResult.repo}`,
      lastUpdated: new Date().toISOString(),
    };
  }

  return {
    rawText: '',
    lines: [],
    images: [],
    source: 'github-repo',
    sourceUrl: `https://github.com/${username}/${repo}`,
  };
}
