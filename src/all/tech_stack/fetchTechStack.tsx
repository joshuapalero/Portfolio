import type { ReactNode } from 'react';
import { Code2 } from 'lucide-react';
import { fetchRawFileViaProxyOrDirect } from '../github_proxy';
import type {
  TechItem,
  TechCategoryGroup,
  TechStackRow,
  TechStackDataResult,
  FetchTechStackParams,
} from './types';
import {
  NextJsIcon,
  TanStackStartIcon,
  ReactIcon,
  TypeScriptIcon,
  JavaScriptIcon,
  ViteIcon,
  NodeIcon,
  BunIcon,
  ExpressIcon,
  HonoIcon,
  HtmlIcon,
  CssIcon,
  TailwindIcon,
  DockerIcon,
  GitHubIcon,
  CiCdIcon,
  CloudflareIcon,
  GitIcon,
  LucideIcon,
  WebSocketIcon,
  ZedIcon,
  EsLintIcon,
  PrettierIcon,
  OpenAiIcon,
  GrokIcon,
  ClaudeIcon,
  PostgreSqlIcon,
  MySqlIcon,
  PrismaIcon,
  ClerkIcon,
  WorkOsIcon,
  XenditIcon,
  GraphQlIcon,
  TrpcIcon,
  GrpcIcon,
  RestIcon,
  OfficialDocsIcon,
  StackOverflowIcon,
  InternetIcon,
} from './tech_icons';

/**
 * Resolves an SVG icon for any given technology name using the unified vector suite.
 */
export function resolveTechIcon(name: string): ReactNode {
  const clean = name.trim().toLowerCase();

  if (/next(\.?js)?/i.test(clean)) return <NextJsIcon />;
  if (/tanstack\s*start/i.test(clean) || /tanstack/i.test(clean)) return <TanStackStartIcon />;
  if (/react/i.test(clean)) return <ReactIcon />;
  if (/typescript|^ts$/i.test(clean)) return <TypeScriptIcon />;
  if (/javascript|^js$/i.test(clean)) return <JavaScriptIcon />;
  if (/vite/i.test(clean)) return <ViteIcon />;
  if (/bun/i.test(clean)) return <BunIcon />;
  if (/node(\.?js)?/i.test(clean)) return <NodeIcon />;
  if (/express(\.?js)?/i.test(clean)) return <ExpressIcon />;
  if (/hono/i.test(clean)) return <HonoIcon />;
  if (/html/i.test(clean)) return <HtmlIcon />;
  if (/css/i.test(clean) && !/tailwind/i.test(clean)) return <CssIcon />;
  if (/tailwind/i.test(clean)) return <TailwindIcon />;
  if (/docker/i.test(clean)) return <DockerIcon />;
  if (/github/i.test(clean) && !/actions/i.test(clean)) return <GitHubIcon />;
  if (/ci\/?cd|actions|pipeline/i.test(clean)) return <CiCdIcon />;
  if (/cloudflare/i.test(clean)) return <CloudflareIcon />;
  if (/git$/i.test(clean) || /^git\b/i.test(clean)) return <GitIcon />;
  if (/lucide/i.test(clean)) return <LucideIcon />;
  if (/websocket/i.test(clean)) return <WebSocketIcon />;
  if (/zed/i.test(clean)) return <ZedIcon />;
  if (/eslint/i.test(clean)) return <EsLintIcon />;
  if (/prettier/i.test(clean)) return <PrettierIcon />;
  if (/openai|chatgpt|gpt/i.test(clean)) return <OpenAiIcon />;
  if (/grok|xai/i.test(clean)) return <GrokIcon />;
  if (/claude|anthropic/i.test(clean)) return <ClaudeIcon />;
  if (/postgres/i.test(clean)) return <PostgreSqlIcon />;
  if (/mysql/i.test(clean)) return <MySqlIcon />;
  if (/prisma/i.test(clean)) return <PrismaIcon />;
  if (/clerk/i.test(clean)) return <ClerkIcon />;
  if (/workos/i.test(clean)) return <WorkOsIcon />;
  if (/xendit/i.test(clean)) return <XenditIcon />;
  if (/graphql/i.test(clean)) return <GraphQlIcon />;
  if (/trpc/i.test(clean)) return <TrpcIcon />;
  if (/grpc/i.test(clean)) return <GrpcIcon />;
  if (/\brest\b|restful|rest api/i.test(clean)) return <RestIcon />;
  if (/official doc|docs|documentation/i.test(clean)) return <OfficialDocsIcon />;
  if (/stack\s*overflow/i.test(clean)) return <StackOverflowIcon />;
  if (/internet|web|rfc/i.test(clean)) return <InternetIcon />;

  return <Code2 size={16} />;
}

/**
 * Derives a 2-character uppercase acronym for category timeline rail boxes.
 */
export function getCategoryAcronym(title: string, explicitAcronym?: string): string {
  if (explicitAcronym && explicitAcronym.trim().length >= 2) {
    return explicitAcronym.trim().slice(0, 3).toUpperCase();
  }

  const t = title.toLowerCase();
  if (t.includes('frontend') || t.includes('ui') || t.includes('user interface')) return 'FE';
  if (t.includes('backend') || t.includes('runtime') || t.includes('api') || t.includes('server')) return 'BE';
  if (t.includes('database') || t.includes('orm') || t.includes('data')) return 'DB';
  if (t.includes('devops') || t.includes('cloud') || t.includes('infra')) return 'DO';
  if (t.includes('tool') || t.includes('workflow') || t.includes('editor')) return 'DW';
  if (t.includes('primary source') || t.includes('doc') || t.includes('knowledge') || t.includes('reference')) return 'PS';
  if (t.includes('ai') || t.includes('artificial intelligence') || t.includes('llm')) return 'AI';

  const clean = title.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  const words = clean.split(/\s+/).filter((w) => !/^(and|or|the|a|an|of|for|in|at|to|&)$/i.test(w));
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (title.slice(0, 2) || 'TS').toUpperCase();
}

/**
 * Builds dynamically balanced, bi-directional marquee loop rows from loaded items.
 */
export function buildBalancedRows(items: readonly TechItem[], rowCount = 5): TechStackRow[] {
  if (items.length === 0) {
    return [];
  }

  const baseDurations = [60000, 66000, 58000, 64000, 70000];
  const rows: TechStackRow[] = [];
  const chunkSize = Math.max(1, Math.ceil(items.length / rowCount));

  for (let r = 0; r < rowCount; r++) {
    const start = r * chunkSize;
    const end = start + chunkSize;
    let rowItems = items.slice(start, end);

    if (rowItems.length === 0) {
      rowItems = items.slice(0, Math.min(items.length, 6));
    }

    rows.push({
      items: Object.freeze(rowItems),
      duration: baseDurations[r % baseDurations.length],
      reverse: r % 2 === 1,
    });
  }

  return rows;
}

/**
 * Parses markdown documentation directly from the user's GitHub Technologies repository README.md.
 */
export function parseLiveTechnologiesReadme(
  markdown: string,
  username: string,
  repo: string,
): { items: TechItem[]; groups: TechCategoryGroup[] } {
  const text = markdown.trim();
  if (!text) {
    return { items: [], groups: [] };
  }

  const lines = text.split(/\r?\n/);

  interface RawSection {
    heading: string;
    lines: string[];
  }
  const sections: RawSection[] = [];
  let currentSection: RawSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^#\s+Technologies/i.test(trimmed) || /^Software\s+Development\s+Architecture/i.test(trimmed)) {
      continue;
    }

    if (/^##\s+/.test(trimmed)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { heading: trimmed.replace(/^##\s+/, ''), lines: [] };
    } else if (currentSection) {
      currentSection.lines.push(line);
    }
  }
  if (currentSection) sections.push(currentSection);

  if (sections.length === 0 && lines.length > 0) {
    sections.push({
      heading: 'General Technologies',
      lines: lines.filter((l) => !/^#\s+/i.test(l.trim())),
    });
  }

  const allItems: TechItem[] = [];
  const groups: TechCategoryGroup[] = [];

  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const sec = sections[sIdx];
    let title = sec.heading;
    let explicitAcronym: string | undefined;

    const headingParts = title.split(/\s*\|\s*|\s*—\s*|\s*-\s*/);
    if (headingParts.length > 1 && /^[A-Za-z0-9]{2,4}$/.test(headingParts[0].trim())) {
      explicitAcronym = headingParts[0].trim().toUpperCase();
      title = headingParts.slice(1).join(' - ').trim();
    }

    let roleTitle = `${title} Architecture`;
    let typeSubtitle = '';
    let durationMeta = 'PRIMARY STACK';
    const paragraphs: string[] = [];
    const groupItems: TechItem[] = [];

    for (const rawLine of sec.lines) {
      const line = rawLine.trim();
      if (!line) continue;

      if (line.startsWith('>')) {
        const quoteContent = line.replace(/^>\s*/, '').trim();
        const segments = quoteContent.split(/\s*\|\s*/);
        for (const seg of segments) {
          const colonIdx = seg.indexOf(':');
          if (colonIdx > 0) {
            const key = seg.slice(0, colonIdx).trim().toLowerCase();
            const val = seg.slice(colonIdx + 1).trim();
            if (key === 'acronym') explicitAcronym = val.toUpperCase();
            else if (key === 'role' || key === 'title') roleTitle = val;
            else if (key === 'meta' || key === 'duration') durationMeta = val;
            else if (key === 'subtitle' || key === 'type') typeSubtitle = val;
          } else {
            if (!roleTitle || roleTitle.endsWith('Architecture')) {
              roleTitle = seg;
            } else if (!durationMeta || durationMeta === 'PRIMARY STACK') {
              durationMeta = seg;
            }
          }
        }
        continue;
      }

      const isBullet = /^\s*[-*+]\s+/.test(rawLine);
      if (isBullet) {
        const itemLine = rawLine.replace(/^\s*[-*+]\s+/, '').trim();
        let name = '';
        let url: string | undefined;
        let role = '';
        let tag = '';

        const linkMatch = itemLine.match(/\[([^\]]+)\]\(([^)]+)\)/);
        let afterLink = itemLine;
        if (linkMatch) {
          name = linkMatch[1].trim();
          url = linkMatch[2].trim();
          afterLink = itemLine
            .replace(/\[([^\]]+)\]\([^)]+\)/, '')
            .replace(/^[\s—–|:-]+/, '')
            .trim();
        }

        const parts = (linkMatch ? afterLink : itemLine)
          .split(/\s*\|\s*|\s+[—–-]\s+/)
          .map((p) => p.replace(/^\*\*|\*\*$/g, '').trim())
          .filter(Boolean);

        if (!name && parts.length > 0) {
          name = parts[0];
          if (parts.length > 1) {
            role = parts[1];
          }
          if (parts.length > 2) {
            tag = parts.slice(2).join(' · ');
          }
        } else if (name && parts.length > 0) {
          role = parts[0];
          if (parts.length > 1) {
            tag = parts.slice(1).join(' · ');
          }
        }

        if (name) {
          const item: TechItem = {
            name,
            category: title,
            role: role || name,
            tag: tag || `${name} Technology`,
            url: url || `https://github.com/${username}/${repo}`,
            iconSvg: resolveTechIcon(name),
          };
          groupItems.push(item);
          allItems.push(item);
        }
        continue;
      }

      if (/^(Technologies|Skills|Tech\s+Stack):\s*/i.test(line)) {
        const listText = line.replace(/^(Technologies|Skills|Tech\s+Stack):\s*/i, '');
        const names = listText.split(/[,\s]+/).map((n) => n.trim()).filter(Boolean);
        for (const n of names) {
          if (!groupItems.some((it) => it.name.toLowerCase() === n.toLowerCase())) {
            const item: TechItem = {
              name: n,
              category: title,
              role: n,
              tag: `${n} Technology`,
              url: `https://github.com/${username}/${repo}`,
              iconSvg: resolveTechIcon(n),
            };
            groupItems.push(item);
            allItems.push(item);
          }
        }
        continue;
      }

      paragraphs.push(line);
    }

    const acronym = getCategoryAcronym(title, explicitAcronym);
    const resolvedSubtitle =
      typeSubtitle ||
      (groupItems.length > 0
        ? `Tools · Frameworks · ${groupItems.length} Technologies`
        : 'Architecture & Specifications');

    const group: TechCategoryGroup = {
      id: `tech-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      acronym,
      title,
      typeSubtitle: resolvedSubtitle,
      roleTitle,
      durationMeta,
      paragraphs:
        paragraphs.length > 0
          ? Object.freeze(paragraphs)
          : Object.freeze([
              `Core technologies and architectural tooling supporting modern scalable development for ${title.toLowerCase()}.`,
            ]),
      items: Object.freeze(groupItems),
    };

    groups.push(group);
  }

  return { items: allItems, groups };
}

/**
 * Parses raw JSON into validated TechItem and TechCategoryGroup objects.
 */
export function parseLiveTechnologiesJson(jsonText: string): { items: TechItem[]; groups: TechCategoryGroup[] } {
  try {
    const parsed = JSON.parse(jsonText);
    const allItems: TechItem[] = [];

    if (Array.isArray(parsed)) {
      const items: TechItem[] = (parsed as Record<string, unknown>[]).map((raw) => ({
        name: String(raw.name || ''),
        category: raw.category ? String(raw.category) : undefined,
        role: raw.role ? String(raw.role) : undefined,
        tag: raw.tag ? String(raw.tag) : undefined,
        url: raw.url ? String(raw.url) : undefined,
        iconSrc: raw.iconSrc ? String(raw.iconSrc) : undefined,
        iconSvg: resolveTechIcon(String(raw.name || '')),
      })).filter((it) => Boolean(it.name));

      const categoryMap = new Map<string, TechItem[]>();
      for (const item of items) {
        const cat = item.category || 'General';
        if (!categoryMap.has(cat)) categoryMap.set(cat, []);
        categoryMap.get(cat)!.push(item);
      }

      const groups: TechCategoryGroup[] = [];
      categoryMap.forEach((catItems, catName) => {
        groups.push({
          id: `tech-${catName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          acronym: getCategoryAcronym(catName),
          title: catName,
          typeSubtitle: `${catItems.length} Technologies`,
          roleTitle: `${catName} Architecture`,
          durationMeta: 'PRIMARY STACK',
          paragraphs: Object.freeze([`Core technologies powering ${catName}.`]),
          items: Object.freeze(catItems),
        });
      });

      return { items, groups };
    }

    if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { groups?: unknown[] }).groups)) {
      const groups: TechCategoryGroup[] = ((parsed as { groups: Record<string, unknown>[] }).groups).map((g) => {
        const gItems: TechItem[] = Array.isArray(g.items)
          ? (g.items as Record<string, unknown>[]).map((it) => ({
              name: String(it.name || ''),
              category: String(it.category || g.title || ''),
              role: it.role ? String(it.role) : undefined,
              tag: it.tag ? String(it.tag) : undefined,
              url: it.url ? String(it.url) : undefined,
              iconSrc: it.iconSrc ? String(it.iconSrc) : undefined,
              iconSvg: resolveTechIcon(String(it.name || '')),
            }))
          : [];
        allItems.push(...gItems);
        return {
          id: String(g.id || `tech-${String(g.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`),
          acronym: String(g.acronym || getCategoryAcronym(String(g.title || ''))),
          title: String(g.title || ''),
          typeSubtitle: String(g.typeSubtitle || `${gItems.length} Technologies`),
          roleTitle: String(g.roleTitle || `${g.title} Architecture`),
          durationMeta: String(g.durationMeta || 'PRIMARY STACK'),
          paragraphs: Array.isArray(g.paragraphs) ? Object.freeze(g.paragraphs.map(String)) : Object.freeze([]),
          items: Object.freeze(gItems),
        };
      });
      return { items: allItems, groups };
    }

    return { items: [], groups: [] };
  } catch (err) {
    console.warn('[Technologies] Failed to parse live JSON:', err);
    return { items: [], groups: [] };
  }
}

/**
 * Fetches dynamic technology stack documentation directly from the user's GitHub repository.
 * Shields users with multi-tier edge fallback and local dynamic fallback.
 */
export async function fetchTechStackFromGithub(
  params: FetchTechStackParams = {},
): Promise<TechStackDataResult> {
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
    'Technologies',
    'technologies',
    'TechStack',
    'techstack',
    'Tech-Stack',
    'tech-stack',
    'Technology',
    'technology',
  ];

  const fileCandidates = ['README.md', 'technologies.json', 'techstack.json'];

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
    const isJson =
      fileResult.text.trim().startsWith('[') || fileResult.text.trim().startsWith('{');
    const { items, groups } = isJson
      ? parseLiveTechnologiesJson(fileResult.text)
      : parseLiveTechnologiesReadme(fileResult.text, resolvedUsername, fileResult.repo);

    if (items.length > 0 && groups.length > 0) {
      const rows = buildBalancedRows(items);
      
      let realLastUpdated = new Date().toISOString();
      try {
        const headers: HeadersInit = { Accept: 'application/vnd.github.v3+json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        
        const repoInfo = await fetch(`https://api.github.com/repos/${resolvedUsername}/${fileResult.repo}`, {
          headers,
          signal: params.signal
        }).catch(() => null);
        
        if (repoInfo && repoInfo.ok) {
          const data = await repoInfo.json();
          if (data.pushed_at) {
            realLastUpdated = data.pushed_at;
          } else if (data.updated_at) {
            realLastUpdated = data.updated_at;
          }
        }
      } catch {
        // Silently fallback to current date if fetch fails
      }

      return {
        items: Object.freeze(items),
        groups: Object.freeze(groups),
        rows: Object.freeze(rows),
        source: 'github-repo',
        sourceUrl: `https://github.com/${resolvedUsername}/${fileResult.repo}`,
        lastUpdated: realLastUpdated,
      };
    }
  }

  // 2. Local dynamic HTTP asset fallback (/data/technologies.json)
  if (typeof fetch !== 'undefined') {
    try {
      const localRes = await fetch('/data/technologies.json', { signal: params.signal }).catch(() => null);
      if (localRes && localRes.ok) {
        const text = await localRes.text();
        if (text && (text.trim().startsWith('[') || text.trim().startsWith('{'))) {
          const { items, groups } = parseLiveTechnologiesJson(text);
          if (items.length > 0) {
            const rows = buildBalancedRows(items);
            return {
              items: Object.freeze(items),
              groups: Object.freeze(groups),
              rows: Object.freeze(rows),
              source: 'json-file',
              sourceUrl: '/data/technologies.json',
              lastUpdated: new Date().toISOString(),
            };
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Fallback: Return empty dynamic structure pointing to the live GitHub repository
  return {
    items: [],
    groups: [],
    rows: [],
    source: 'github-repo',
    sourceUrl: `https://github.com/${resolvedUsername}/Technologies`,
    lastUpdated: new Date().toISOString(),
  };
}
