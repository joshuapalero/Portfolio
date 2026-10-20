import { fetchRawFileViaProxyOrDirect } from '../github_proxy';
import { resolveResourceIcon } from './resolve_resource_icon';
import { getCategoryAcronym } from './track_helpers';
import type {
  ResourceItem,
  ResourceRailGroup,
  ResourcesDataResult,
} from './types';

export interface FetchResourcesParams {
  username?: string;
  token?: string;
  signal?: AbortSignal;
}

/**
 * Normalizes space or comma-separated technology tags.
 */
function extractTags(text: string): string[] {
  return text
    .replace(/^tags?:\s*/i, '')
    .split(/,\s*|\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function deriveShortBadge(category: string, rawLine: string, name: string): string {
  const catLower = category.toLowerCase();
  const lineLower = rawLine.toLowerCase();
  const nameLower = name.toLowerCase();

  if (catLower.includes('ai') || catLower.includes('llm') || lineLower.includes('llm') || nameLower.includes('openai') || nameLower.includes('anthropic')) {
    if (lineLower.includes('agent') || lineLower.includes('langchain')) return 'AI Agent';
    if (lineLower.includes('vector') || lineLower.includes('chroma') || lineLower.includes('rag')) return 'Vector DB';
    if (lineLower.includes('course') || lineLower.includes('masterclass') || lineLower.includes('video')) return 'AI Learn';
    if (lineLower.includes('model') || lineLower.includes('hugging')) return 'AI Model';
    return 'AI / LLM';
  }

  if (catLower.includes('database') || catLower.includes('orm')) {
    if (lineLower.includes('orm') || lineLower.includes('prisma')) return 'ORM';
    if (lineLower.includes('cache') || lineLower.includes('redis')) return 'Cache';
    if (lineLower.includes('nosql') || lineLower.includes('mongo')) return 'NoSQL';
    return 'SQL DB';
  }

  if (catLower.includes('devops') || catLower.includes('infra') || catLower.includes('cloud')) {
    if (lineLower.includes('container') || lineLower.includes('docker')) return 'Containers';
    if (lineLower.includes('edge') || lineLower.includes('cloudflare') || lineLower.includes('vercel')) return 'Edge CDN';
    if (lineLower.includes('action') || lineLower.includes('ci/cd')) return 'CI/CD';
    return 'DevOps';
  }

  if (catLower.includes('auth') || catLower.includes('identity')) {
    if (lineLower.includes('sso') || lineLower.includes('saml') || lineLower.includes('workos')) return 'SSO Auth';
    if (lineLower.includes('pay') || lineLower.includes('fintech') || lineLower.includes('xendit')) return 'Fintech';
    return 'User Auth';
  }

  if (catLower.includes('state') || catLower.includes('validation')) {
    if (lineLower.includes('query') || lineLower.includes('tanstack')) return 'State';
    if (lineLower.includes('zod') || lineLower.includes('schema')) return 'Schema';
    return 'State';
  }

  // ── Check video/masterclass/visual BEFORE styling/ui ─────────────────────
  // 'engineering-masterclasses-visual-guides' contains 'ui' as a substring
  // inside the word 'visual' → must be checked first to avoid a false-positive.
  if (catLower.includes('video') || catLower.includes('masterclass') || catLower.includes('visual')) {
    if (lineLower.includes('visual') || lineLower.includes('lydia')) return 'Visuals';
    return 'Videos';
  }

  // Use word-boundary regex so 'visual-guides' does not trigger on \bui\b.
  if (catLower.includes('styling') || /\bui\b/.test(catLower)) {
    if (lineLower.includes('tailwind')) return 'Styling';
    if (lineLower.includes('icon') || lineLower.includes('lucide')) return 'Icons';
    return 'UI Prims';
  }

  if (catLower.includes('framework')) {
    if (lineLower.includes('full-stack') || lineLower.includes('fullstack') || lineLower.includes('start')) return 'Fullstack';
    if (lineLower.includes('runtime') || lineLower.includes('bun')) return 'Runtime';
    if (lineLower.includes('build') || lineLower.includes('vite')) return 'Build';
    return 'React';
  }

  if (catLower.includes('backend') || catLower.includes('api')) {
    if (lineLower.includes('rpc') || lineLower.includes('trpc') || lineLower.includes('grpc')) return 'RPC';
    if (lineLower.includes('real-time') || lineLower.includes('websocket')) return 'Realtime';
    if (lineLower.includes('graphql')) return 'GraphQL';
    return 'Server API';
  }

  if (catLower.includes('standard') || catLower.includes('doc')) {
    if (lineLower.includes('type') || lineLower.includes('typescript')) return 'Types';
    if (lineLower.includes('qa') || lineLower.includes('stack overflow')) return 'Q&A Help';
    return 'Web Specs';
  }

  // ── Generic full-stack heading: '## Full Stack' → category slug 'full-stack' ─
  // Derive a meaningful badge from the technology name / line content.
  if (catLower.includes('full-stack') || catLower.includes('full_stack')) {
    if (nameLower.includes('react') || nameLower.includes('next') || lineLower.includes('rsc') || lineLower.includes('server component')) return 'Frontend';
    if (nameLower.includes('node') || nameLower.includes('express') || lineLower.includes('rest api') || lineLower.includes('websocket') || nameLower.includes('graphql')) return 'Backend';
    if (nameLower.includes('postgres') || nameLower.includes('mysql') || nameLower.includes('redis') || nameLower.includes('prisma')) return 'Database';
    if (nameLower.includes('docker') || nameLower.includes('vercel') || nameLower.includes('cloudflare') || nameLower.includes('ci/cd') || nameLower.includes('github')) return 'DevOps';
    if (nameLower.includes('tailwind') || nameLower.includes('shadcn')) return 'Styling';
    if (nameLower.includes('vite') || nameLower.includes('bun') || nameLower.includes('typescript')) return 'Tooling';
    return 'Full Stack';
  }

  return 'Learn';
}

/**
 * Parses markdown documentation directly from the user's GitHub Resources repository
 * (e.g. joshuapalero/Resources/README.md).
 * Accurately associates bullet items with their preceding `## Category` section headings.
 * Also extracts the optional subtitle — any plain text written between the `# Title`
 * heading and the first `## Section` heading — so it can be rendered dynamically.
 */
export function parseLiveResourcesReadme(
  markdown: string,
  username: string,
  repo: string,
): { readonly items: readonly ResourceItem[]; readonly subtitle: string } {
  const text = markdown.trim();
  if (!text) return { items: [], subtitle: '' };

  const lines = text.split(/\r?\n/);
  const items: ResourceItem[] = [];

  // ── Extract subtitle: text between `# Title` and first `##` heading ──────
  let pastTitle = false;
  const subtitleLines: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!pastTitle) {
      if (/^#\s+/.test(t)) pastTitle = true;   // reached the # Title line
      continue;
    }
    if (/^#{2,}/.test(t)) break;               // first ## section — stop collecting
    if (t) subtitleLines.push(t);              // plain text lines only
  }
  const subtitle = subtitleLines.join(' ').trim();

  let currentCategory = 'frameworks';
  let currentCategoryLabel = 'Full stack resources';
  let currentSectionDescription = '';
  // Accumulate description lines between a ## heading and the first bullet
  let pendingDescLines: string[] = [];
  let awaitingDesc = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for section headings: "## Category Title" or "### Subcategory"
    const headingMatch = trimmed.match(/^#{2,3}\s+(.+)$/);
    if (headingMatch) {
      const headingText = headingMatch[1].trim();
      // Only treat as category if it doesn't contain markdown links
      if (!headingText.includes('](')) {
        currentCategoryLabel = headingText;
        currentCategory = headingText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        // Reset section description collection for the new heading
        pendingDescLines = [];
        currentSectionDescription = '';
        awaitingDesc = true;
        continue;
      }
    }

    // Skip top-level document heading: "# Developer Resources"
    if (/^#\s+/i.test(trimmed)) continue;

    // Empty lines are skipped but not excluded — let the loop continue naturally
    if (!trimmed) continue;

    // Collect description text between a ## heading and the first bullet item.
    // Any non-empty, non-bullet, non-heading line that appears right after a ##
    // heading becomes the section's human-readable subtitle.
    if (awaitingDesc && trimmed && !/^\s*[-*+]\s+/.test(line)) {
      pendingDescLines.push(trimmed);
      continue;
    }

    // Check for list bullet items: "- [Name](url) - Tagline | [Docs](...) | [Repo](...) | tags: ..."
    if (/^\s*[-*+]\s+/.test(line)) {
      // First bullet in this section — lock in the collected description
      if (awaitingDesc) {
        currentSectionDescription = pendingDescLines.join(' ').trim();
        awaitingDesc = false;
        pendingDescLines = [];
      }

      const rawLine = line.replace(/^\s*[-*+]\s+/, '').trim();
      if (!rawLine) continue;

      const linkMatches = Array.from(rawLine.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g));
      if (linkMatches.length === 0) continue;

      const name = linkMatches[0][1].trim();
      const websiteUrl = linkMatches[0][2].trim();
      let docsUrl: string | undefined;
      let githubUrl: string | undefined;

      // Extract secondary links: docs, repo, etc.
      for (let j = 1; j < linkMatches.length; j++) {
        const linkText = linkMatches[j][1].toLowerCase();
        const linkHref = linkMatches[j][2].trim();

        if (
          linkText.includes('doc') ||
          linkText.includes('guide') ||
          linkText.includes('ref') ||
          linkText.includes('course') ||
          linkText.includes('learn') ||
          linkText.includes('overview') ||
          linkText.includes('project') ||
          linkText.includes('help') ||
          linkText.includes('book')
        ) {
          if (!docsUrl) {
            docsUrl = linkHref;
          } else if (!githubUrl && (linkHref.includes('github.com') || linkText.includes('repo'))) {
            githubUrl = linkHref;
          }
        } else if (linkText.includes('repo') || linkText.includes('github') || linkHref.includes('github.com')) {
          githubUrl = linkHref;
        } else if (!docsUrl) {
          docsUrl = linkHref;
        }
      }

      // Parse pipe segments: segment 0 = "[Name](url) - Tagline", segment 1 = "[Docs](url)", segment 2 = "[Repo](url)", segment 3 = "tags: ..."
      const pipes = rawLine.split('|').map((s) => s.trim());
      const firstSegment = pipes[0];
      const afterLink = firstSegment.replace(/\[([^\]]+)\]\([^)]+\)/, '').trim();
      const cleanTagline = afterLink.replace(/^[-—–:\s]+/, '').trim();

      let description = cleanTagline;
      let tags: string[] = [];
      let featured = false;

      for (let pIdx = 1; pIdx < pipes.length; pIdx++) {
        const p = pipes[pIdx];
        const tagMatch = p.match(/(?:tags?|keywords?):\s*([^\n]+)/i);
        if (tagMatch) {
          tags = extractTags(tagMatch[1]);
        } else if (!p.startsWith('[') && !description.includes(p)) {
          description = description ? `${description} ${p}` : p;
        }
      }

      if (/featured|recommended/i.test(rawLine)) {
        featured = true;
      }

      const shortBadge = deriveShortBadge(currentCategory, rawLine, name);
      const isVideo =
        websiteUrl.includes('youtube.com') ||
        currentCategory.includes('video') ||
        currentCategory.includes('masterclass');
      const visitLabel = isVideo ? `Watch ${name}` : `Visit ${name}`;

      const id =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `res-${items.length + 1}`;

      const itemObj: ResourceItem = {
        id,
        name,
        shortBadge,
        visitLabel,
        category: currentCategory,
        categoryLabel: currentCategoryLabel,
        sectionDescription: currentSectionDescription || undefined,
        tagline: cleanTagline || `Official ${name} developer documentation & resources.`,
        description: description || cleanTagline || `Comprehensive resources for ${name}.`,
        websiteUrl,
        docsUrl,
        githubUrl,
        tags,
        featured,
      };

      itemObj.icon = resolveResourceIcon(itemObj);
      items.push(itemObj);
    }
  }

  // Heading-based fallback if no list items found
  if (items.length === 0) {
    const sections = text.split(/(?=^#{2,3}\s+)/m);
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i].trim();
      if (!sec || /^#\s*Resources/i.test(sec)) continue;

      const headerMatch = sec.match(/^(#{2,3})\s+(.+)$/m);
      if (!headerMatch) continue;

      const headingLevel = headerMatch[1];
      const headerText = headerMatch[2].trim();
      const linkMatch = headerText.match(/\[([^\]]+)\]\(([^)]+)\)/);

      if (headingLevel === '##' && !linkMatch) {
        currentCategory =
          headerText
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || 'frameworks';
        currentCategoryLabel = headerText;
        continue;
      }

      const name = linkMatch ? linkMatch[1].trim() : headerText.replace(/\*\*/g, '').trim();
      const websiteUrl = linkMatch ? linkMatch[2].trim() : `https://github.com/${username}/${repo}`;

      const bodyLines = sec.split('\n').filter((l) => !l.startsWith('#') && l.trim());
      const body = bodyLines.join(' ').trim();

      const id =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || `live-res-${items.length + 1}`;

      const itemObj: ResourceItem = {
        id,
        name,
        shortBadge: 'Learn',
        visitLabel: `Visit ${name}`,
        category: currentCategory,
        categoryLabel: currentCategoryLabel,
        tagline: body.slice(0, 100) || `Resource entry from ${repo}/README.md.`,
        description: body || `Documentation record from ${repo}/README.md.`,
        websiteUrl,
        tags: [],
        featured: false,
      };
      itemObj.icon = resolveResourceIcon(itemObj);
      items.push(itemObj);
    }
  }

  return { items: Object.freeze(items), subtitle };
}

/**
 * Dynamically groups ResourceItem records into rail groups using each item's
 * `categoryLabel`, which is parsed directly from the `## Heading` sections
 * in the GitHub README.
 *
 * Adding or renaming a `## Section` in your README automatically creates
 * or updates its corresponding group — no code changes required.
 */
export function groupResourcesByCategory(
  items: readonly ResourceItem[],
): readonly ResourceRailGroup[] {
  if (items.length === 0) return [];

  // Preserve the order sections appear in the README (insertion order of Map)
  const groupMap = new Map<string, ResourceItem[]>();

  for (const item of items) {
    const label = item.categoryLabel || 'Resources';
    if (!groupMap.has(label)) {
      groupMap.set(label, []);
    }
    groupMap.get(label)!.push(item);
  }

  const groups: ResourceRailGroup[] = Array.from(groupMap.entries()).map(
    ([categoryLabel, groupItems]) => {
      const categorySlug =
        groupItems[0]?.category ||
        categoryLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const acronym = getCategoryAcronym(categoryLabel);

      return {
        id: `group-${categorySlug}`,
        acronym,
        title: categoryLabel,
        roleTitle: categoryLabel,
        typeSubtitle: groupItems.slice(0, 7).map((i) => i.name).join(' · '),
        paragraphs: [`Curated ${categoryLabel} resources for modern software development.`],
        items: groupItems,
      };
    },
  );

  return Object.freeze(groups);
}

/**
 * Intelligent classifier that checks if a resource belongs to AI Engineering & LLM Systems.
 */
export function isAiResource(item: {
  category?: string;
  categoryLabel?: string;
  name?: string;
  tags?: readonly string[];
}): boolean {
  const cat = (item.category || '').toLowerCase();
  const catLabel = (item.categoryLabel || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  const tags = (item.tags || []).map((t) => t.toLowerCase());

  if (
    cat.startsWith('ai-') ||
    cat === 'ai' ||
    cat === 'machine-learning' ||
    catLabel.includes('ai engineering') ||
    catLabel.includes('large language model') ||
    catLabel.includes('vector store') ||
    catLabel.includes('vector database') ||
    catLabel.includes('frontier llm')
  ) {
    return true;
  }

  const hasAiName =
    /\b(openai|gpt|anthropic|claude|langchain|langgraph|llamaindex|ollama|vllm|chroma\s*db|pgvector|prompting\s*guide|guardrails|langsmith|hugging\s*face|cohere|ragas|ai\s*sdk)\b/i.test(
      name,
    );

  const hasAiTag = tags.some((t) =>
    /\b(gpt-4o|claude|prompt engineering|rag pipelines?|vector db|vector store|agentic ai|local llms|pagedattention|llmops|ai safety)\b/i.test(
      t,
    ),
  );

  return hasAiName || hasAiTag;
}

/**
 * Intelligent classifier that checks if a resource belongs to Engineering Personalities & Educators.
 */
export function isPersonalityResource(item: {
  category?: string;
  categoryLabel?: string;
  name?: string;
  githubUrl?: string;
  websiteUrl?: string;
  tags?: readonly string[];
}): boolean {
  const cat = (item.category || '').toLowerCase();
  const catLabel = (item.categoryLabel || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  const tags = (item.tags || []).map((t) => t.toLowerCase());
  const web = (item.websiteUrl || '').toLowerCase();

  if (
    cat.includes('personality') ||
    cat.includes('educator') ||
    cat.includes('masterclass') ||
    cat.includes('video-learning') ||
    cat.includes('engineering-masterclasses') ||
    catLabel.includes('educator') ||
    catLabel.includes('personality') ||
    catLabel.includes('masterclass') ||
    catLabel.includes('visual guide')
  ) {
    return true;
  }

  const isPerson = /\b(aurora\s*scharff|lydia\s*hallie|theo\.gg|jack\s*herrington|dan\s*abramov|kent\s*c\.?\s*dodds|lee\s*robinson|simon\s*willison|andrej\s*karpathy|web\s*dev\s*simplified|fireship|alex\s*albert|swyx|callstack\s*engineers?|callstackengineers|linq|thelinqapp|the\s*linq\s*app)\b/i.test(
    name,
  );

  const isVideoOrChannel =
    web.includes('youtube.com') ||
    tags.some((t) => /\b(youtube|creator|educator|instructor|masterclass|course)\b/i.test(t));

  return isPerson || isVideoOrChannel;
}

/**
 * Intelligent classifier that checks if a resource belongs to Web References, Standards & Specifications.
 */
export function isReferenceResource(item: {
  category?: string;
  categoryLabel?: string;
  name?: string;
  tags?: readonly string[];
}): boolean {
  if (isPersonalityResource(item) || isAiResource(item)) return false;

  const cat = (item.category || '').toLowerCase();
  const catLabel = (item.categoryLabel || '').toLowerCase();
  const name = (item.name || '').toLowerCase();
  const tags = (item.tags || []).map((t) => t.toLowerCase());

  if (
    cat.includes('documentation') ||
    cat.includes('standard') ||
    cat.includes('reference') ||
    cat.includes('spec') ||
    catLabel.includes('web standards') ||
    catLabel.includes('reference specification') ||
    catLabel.includes('official doc')
  ) {
    return true;
  }

  const isRefName = /\b(mdn|mozilla|typescript\s*handbook|ecmascript|tc39|w3c|web\s*specs?|stack\s*overflow|caniuse)\b/i.test(
    name,
  );

  const isRefTag = tags.some((t) => /\b(spec|standard|handbook|rfc|standards|w3c|mdn)\b/i.test(t));

  return isRefName || isRefTag;
}

/**
 * Intelligent classifier that checks if a resource belongs to Core Full-Stack Web Development.
 */
export function isFullstackResource(item: {
  category?: string;
  categoryLabel?: string;
  name?: string;
  githubUrl?: string;
  websiteUrl?: string;
  tags?: readonly string[];
}): boolean {
  return (
    !isAiResource(item) &&
    !isPersonalityResource(item) &&
    !isReferenceResource(item)
  );
}

/**
 * Fetches resources dynamically exclusively from the user's GitHub Repository README.md
 * across proxy and direct CDN.
 */
export async function fetchResourcesFromGithub(
  params: FetchResourcesParams = {},
): Promise<ResourcesDataResult> {
  const resolvedUsername = (
    params.username ||
    (typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_GITHUB_USERNAME as string | undefined)
      : undefined) ||
    'joshuapalero'
  ).trim();

  const token =
    params.token ||
    (typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_GITHUB_TOKEN as string | undefined)
      : undefined);

  const repoCandidates = [
    'Resources',
    'resources',
    'Developer-Resources',
    'developer-resources',
    'developer_resources',
  ];

  // README.md is exclusively used as the primary live markdown file edited on GitHub
  const fileCandidates = ['README.md'];

  // 1. Live GitHub Multi-Tier Proxy & CDN fetch
  const fileResult = await fetchRawFileViaProxyOrDirect(
    resolvedUsername,
    repoCandidates,
    fileCandidates,
    ['main', 'master'],
    token,
    params.signal,
  );

  if (fileResult && fileResult.text) {
    const { items: rawItems, subtitle } = parseLiveResourcesReadme(fileResult.text, resolvedUsername, fileResult.repo);

    if (rawItems.length > 0) {
      // Position Full-Stack resources FIRST at top, followed by AI resources
      const fullstackItems = rawItems.filter((it) => !isAiResource(it));
      const aiItems = rawItems.filter((it) => isAiResource(it));
      const orderedItems = [...fullstackItems, ...aiItems];

      // Deduplicate items by ID
      const seenIds = new Set<string>();
      const items: ResourceItem[] = [];
      for (const it of orderedItems) {
        if (!seenIds.has(it.id)) {
          seenIds.add(it.id);
          items.push(it);
        }
      }

      const groups = groupResourcesByCategory(items);

      // Fetch the actual repo pushed_at/updated_at timestamp so the portfolio
      // accurately reflects the last time the repository was changed.
      let realLastUpdated = new Date().toISOString();
      if (token) {
        try {
          const repoRes = await fetch(`https://api.github.com/repos/${resolvedUsername}/${fileResult.repo}`, {
            headers: { Authorization: `Bearer ${token}` },
            signal: params.signal,
          });
          if (repoRes.ok) {
            const repoData = await repoRes.json();
            if (repoData.pushed_at) {
              realLastUpdated = repoData.pushed_at;
            } else if (repoData.updated_at) {
              realLastUpdated = repoData.updated_at;
            }
          }
        } catch {
          // Fallback to fetch time if network fails
        }
      }

      return {
        items,
        groups,
        subtitle: subtitle || undefined,
        source: 'github-repo',
        sourceUrl: `https://github.com/${resolvedUsername}/${fileResult.repo}`,
        lastUpdated: realLastUpdated,
      };
    }
  }

  // Fallback: Return empty dynamic structure pointing directly to the live GitHub repository
  return {
    items: [],
    groups: [],
    source: 'github-repo',
    sourceUrl: `https://github.com/${resolvedUsername}/Resources`,
    lastUpdated: new Date().toISOString(),
  };
}
