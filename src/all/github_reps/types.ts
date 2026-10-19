export interface ContributionItem {
  date: string;
  count: number;
  level: number;
}

export interface ContributionDay {
  dayOfWeek: number;
  date: string;
  iso: string;
  level: number;
  count: number;
}

export interface ContributionMonth {
  name: string;
  col: number;
}

export interface ContributionsData {
  total?: Record<string | number, number>;
  contributions?: ContributionItem[];
}

export interface GithubRepoItem {
  id: number;
  name: string;
  full_name?: string;
  html_url: string;
  description?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  language?: string | null;
  topics?: string[];
  homepage?: string | null;
  updated_at?: string;
  archived?: boolean;
}

export interface GithubReposProps {
  readonly username?: string;
  readonly token?: string;
  readonly sectionNumber?: string;
  readonly sectionTitle?: string;
  readonly subtitle?: string;
}
