import type { PracticeActivityItem } from './types';

/**
 * Base skeleton for Git Practice Activity, metadata only.
 * Content is dynamically fetched from GitHub.
 */
export const GIT_PRACTICE_ACTIVITY: PracticeActivityItem = {
  id: 'git-mastery',
  slug: 'git',
  title: 'Learn Git with me',
  subtitle: 'Dynamically loaded from GitHub',
  category: 'VCS & Collaboration',
  categoryLabel: 'Version Control',
  difficulty: 'Mastery',
  summary:
    'Practice Git by applying established best practices and proven patterns from online resources. The official documentation is always available for reference and further study.',
  excerpt:
    'Practice Git by applying established best practices and proven patterns from online resources. The official documentation is always available for reference and further study.',
  tags: ['Git', 'VCS', 'CLI', 'DevOps', 'Rebase', 'Worktrees', 'Reflog'],
  officialDocsUrl: 'https://git-scm.com/doc',
  bestPracticesUrl: 'https://github.blog/open-source/git/',
  totalCommands: 0,
  iconName: 'GitBranch',
  lastUpdated: new Date().toISOString().split('T')[0],
  isFeatured: true,
  sections: [],
};
