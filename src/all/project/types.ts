export interface RawGithubRepo {
  id: number;
  name: string;
  description?: string | null;
  language?: string | null;
  stargazers_count: number;
  forks_count?: number;
  topics?: string[];
  homepage?: string | null;
  html_url: string;
  archived?: boolean;
  pushed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CardProject {
  id: number;
  name: string;
  description: string;
  language: string;
  badge: string;
  tags: string[];
  liveUrl: string | null;
  repoUrl: string;
  stars?: number;
  forks?: number;
  updatedAt?: string;
}

export interface GithubProjectProps {
  readonly username?: string;
  readonly token?: string;
  readonly sectionNumber?: string;
  readonly sectionTitle?: string;
  readonly onViewAllProjects?: () => void;
}

export interface ProjectsHistoryProps {
  readonly username?: string;
  readonly token?: string;
  readonly onBack?: () => void;
  readonly subtitle?: string;
}

