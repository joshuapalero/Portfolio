import type { ReactNode } from 'react';
import {
  Layers,
  Cpu,
  Video,
  BookOpen,
  Server,
  Database,
  Cloud,
  FileCode2,
} from 'lucide-react';
import type { ResourceItem } from './types';

export interface ResourceTrackSummary {
  readonly id: string;
  readonly acronym: string;
  readonly badge: string;
  readonly title: string;
  readonly categoryLabel: string;
  readonly description: string;
  readonly itemCount: number;
  readonly techPreview: string;
  readonly icon: ReactNode;
  /** ISO date string representing when data was last fetched from GitHub */
  readonly lastUpdated?: string;
  /** First 4 item icons for the thumbnail grid */
  readonly previewIcons: ReactNode[];
}

/**
 * High-signal visual icon mapping for resource tracks.
 */
export function getTrackIcon(acronym: string, id: string): ReactNode {
  switch (acronym.toUpperCase()) {
    case 'FE':
      return <Layers size={24} className="resources-thumb-icon" aria-hidden="true" />;
    case 'AI':
      return <Cpu size={24} className="resources-thumb-icon" aria-hidden="true" />;
    case 'PE':
    case 'YT':
      return <Video size={24} className="resources-thumb-icon" aria-hidden="true" />;
    case 'RE':
    case 'DW':
      return <BookOpen size={24} className="resources-thumb-icon" aria-hidden="true" />;
    case 'BE':
      return <Server size={24} className="resources-thumb-icon" aria-hidden="true" />;
    case 'DB':
      return <Database size={24} className="resources-thumb-icon" aria-hidden="true" />;
    case 'DO':
      return <Cloud size={24} className="resources-thumb-icon" aria-hidden="true" />;
    default:
      if (id.includes('ai')) return <Cpu size={24} className="resources-thumb-icon" aria-hidden="true" />;
      if (id.includes('person') || id.includes('video')) return <Video size={24} className="resources-thumb-icon" aria-hidden="true" />;
      if (id.includes('ref') || id.includes('doc')) return <BookOpen size={24} className="resources-thumb-icon" aria-hidden="true" />;
      return <FileCode2 size={24} className="resources-thumb-icon" aria-hidden="true" />;
  }
}

/**
 * Dynamically computes a 2-character uppercase acronym from a category label.
 * e.g. "Full stack resources" -> "FS"
 * e.g. "Databases & ORMs"               -> "DB"
 * e.g. "AI Engineering, LLM Frameworks" -> "AI"
 */
export function getCategoryAcronym(title: string): string {
  const clean = title.replace(/[^a-zA-Z0-9\s]/g, ' ').trim();
  const words = clean.split(/\s+/).filter((w) => !/^(and|or|the|a|an|of|for|in|at|to|&)$/i.test(w));
  if (words.length >= 2) {
    if (/^ai\b/i.test(words[0])) return 'AI';
    if (/^ml\b/i.test(words[0])) return 'ML';
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }
  if (words.length === 1 && words[0].length >= 2) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return (title.slice(0, 2) || 'RS').toUpperCase();
}

/**
 * Construct Resource Tracks purely derived from live repository items.
 * Groups are built dynamically from each item's `categoryLabel`, which is
 * parsed directly from the `## Heading` sections in the GitHub README.
 *
 * Adding or renaming a `## Section` in your README automatically creates
 * or updates its corresponding track — no code changes required.
 */
export function buildResourceTracks(
  items: readonly ResourceItem[],
  lastUpdated?: string,
): ResourceTrackSummary[] {
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

  return Array.from(groupMap.entries()).map(([categoryLabel, groupItems]) => {
    // `category` is the slug already derived from the heading during parsing
    const id =
      groupItems[0]?.category ||
      categoryLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const acronym = getCategoryAcronym(categoryLabel);

    // Collect up to 4 resolved icons for the thumbnail preview grid
    const previewIcons = groupItems.slice(0, 4).map((i) => i.icon ?? null);

    return {
      id,
      acronym,
      badge: acronym,
      title: categoryLabel,
      categoryLabel,
      description: groupItems[0]?.sectionDescription || `Curated ${categoryLabel.toLowerCase()} resources.`,
      itemCount: groupItems.length,
      techPreview: groupItems.map((i) => i.name).join(' · '),
      icon: getTrackIcon(acronym, id),
      lastUpdated,
      previewIcons,
    };
  });
}
