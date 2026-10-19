/**
 * Difficulty level for practice activity topics.
 */
export type PracticeDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Mastery';

/**
 * Command example item within a practice topic guide.
 */
export interface PracticeCommandExample {
  readonly id: string;
  readonly title: string;
  readonly command: string;
  readonly description: string;
  readonly category: string;
  readonly whenToUse?: string;
  readonly flagsExplained?: readonly {
    readonly flag: string;
    readonly explanation: string;
  }[];
  readonly outputExample?: string;
  readonly warningOrTip?: string;
  readonly isBestPractice?: boolean;
}

/**
 * Practice Activity Topic/Module (e.g., Git Mastery).
 */
export interface PracticeActivityItem {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly subtitle: string;
  readonly category: string;
  readonly categoryLabel: string;
  readonly difficulty: PracticeDifficulty;
  readonly summary: string;
  readonly excerpt: string;
  readonly tags: readonly string[];
  readonly officialDocsUrl: string;
  readonly bestPracticesUrl?: string;
  readonly totalCommands: number;
  readonly iconName: string;
  readonly lastUpdated: string;
  readonly sections: readonly PracticeSection[];
  readonly isFeatured?: boolean;
}

/**
 * Section grouping related commands (e.g., "Branching & Switching", "Interactive Rebase").
 */
export interface PracticeSection {
  readonly id: string;
  readonly sectionNumber: string;
  readonly title: string;
  readonly description: string;
  readonly bestPracticesNotes?: readonly string[];
  readonly examples: readonly PracticeCommandExample[];
}

/**
 * Query response payload adhering to Aurora Scharff resilient data-layer specifications.
 */
export interface PracticeActivityDataResult {
  readonly items: readonly PracticeActivityItem[];
  readonly source: 'github-repo' | 'fallback-curriculum';
  readonly sourceUrl: string;
  readonly lastUpdated: string;
  readonly rawMarkdown?: string;
  readonly subtitle?: string;
}
