import type { ReactNode } from 'react';
import { z } from 'zod';

export type RoadmapTrackId = 'fullstack' | 'ai-engineering' | 'personalities';

export interface ResourceCategoryMeta {
  readonly id: string;
  readonly label: string;
  readonly description: string;
}

export const ResourceItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).slice(2, 9)),
  name: z.string(),
  shortBadge: z.string().optional(),
  visitLabel: z.string().optional(),
  category: z.string().default('frameworks'),
  categoryLabel: z.string().default('Development Tool'),
  tagline: z.string().default(''),
  description: z.string().default(''),
  websiteUrl: z.union([z.string(), z.literal('')]).default(''),
  docsUrl: z.union([z.string(), z.literal('')]).optional(),
  githubUrl: z.union([z.string(), z.literal('')]).optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().optional(),
  iconName: z.string().optional(),
});

export const resourcesSchema = z.array(ResourceItemSchema);

export type ResourceItem = z.infer<typeof ResourceItemSchema> & {
  icon?: ReactNode;
  /** Plain-text description from the README written below a `## Section` heading. */
  sectionDescription?: string;
};

export type ResourcesItems = z.infer<typeof resourcesSchema>;

export interface RoadmapStage {
  readonly id: string;
  readonly stageNumber: string;
  readonly levelLabel: string;
  readonly title: string;
  readonly tagline: string;
  readonly summary: string;
  readonly milestones: readonly string[];
  readonly items: readonly ResourceItem[];
}

export interface RoadmapTrack {
  readonly id: RoadmapTrackId;
  readonly title: string;
  readonly shortName: string;
  readonly badge: string;
  readonly iconName: string;
  readonly description: string;
  readonly stages: readonly RoadmapStage[];
}

export interface PersonalityProfile {
  readonly id: string;
  readonly name: string;
  readonly role: string;
  readonly specialty: string;
  readonly bio: string;
  readonly keyTopics: readonly string[];
  readonly links: readonly {
    readonly label: string;
    readonly url: string;
    readonly type: 'video' | 'website' | 'github';
  }[];
  readonly quote: string;
}

export interface SeniorMindset {
  readonly id: string;
  readonly title: string;
  readonly principle: string;
  readonly description: string;
  readonly takeaway: string;
}

export interface ResourceRailGroup {
  readonly id: string;
  readonly acronym: string;
  readonly title: string;
  readonly typeSubtitle: string;
  readonly roleTitle: string;
  readonly durationMeta?: string;
  readonly paragraphs: readonly string[];
  readonly items: readonly ResourceItem[];
}

export interface ResourcesDataResult {
  readonly items: readonly ResourceItem[];
  readonly groups: readonly ResourceRailGroup[];
  readonly tracks?: readonly RoadmapTrack[];
  readonly personalities?: readonly PersonalityProfile[];
  readonly mindsets?: readonly SeniorMindset[];
  readonly source: 'github-repo';
  readonly sourceUrl: string;
  readonly lastUpdated?: string;
  /** Description text written below `# Title` and above the first `## Section` in the README. */
  readonly subtitle?: string;
}

export interface ResourcesProps {
  readonly sectionNumber?: string;
  readonly sectionTitle?: string;
  readonly subtitle?: string;
  readonly username?: string;
  readonly token?: string;
  readonly onViewAllResources?: () => void;
  readonly onSelectTrack?: (trackId: string) => void;
}

export interface ResourcesHistoryProps {
  readonly username?: string;
  readonly token?: string;
  readonly trackId?: string;
  readonly backLabel?: string;
  readonly onBack?: () => void;
}
