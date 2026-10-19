import type { ReactNode } from 'react';

export interface TechItem {
  readonly name: string;
  readonly category?: string;
  readonly iconSrc?: string;
  readonly iconSvg?: ReactNode;
  readonly role?: string;
  readonly tag?: string;
  readonly url?: string;
}

export interface TechCategoryGroup {
  readonly id: string;
  readonly acronym: string;
  readonly title: string;
  readonly typeSubtitle: string;
  readonly roleTitle: string;
  readonly durationMeta: string;
  readonly paragraphs: readonly string[];
  readonly items: readonly TechItem[];
}

export interface TechStackRow {
  readonly items: readonly TechItem[];
  readonly duration: number;
  readonly reverse: boolean;
}

export interface TechStackDataResult {
  readonly items: readonly TechItem[];
  readonly groups: readonly TechCategoryGroup[];
  readonly rows: readonly TechStackRow[];
  readonly source: 'github-repo' | 'json-file' | 'fallback';
  readonly sourceUrl?: string;
  readonly lastUpdated?: string;
}

export interface FetchTechStackParams {
  readonly username?: string;
  readonly token?: string;
  readonly signal?: AbortSignal;
}

export interface TechStackProps {
  readonly sectionNumber?: string;
  readonly sectionTitle?: string;
  readonly title?: string;
  readonly subtitle?: string;
  readonly onViewAllTech?: () => void;
  readonly username?: string;
}

export interface TechStackHistoryProps {
  readonly onBack?: () => void;
  readonly username?: string;
}
