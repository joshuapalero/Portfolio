/**
 * Normalizes a repository name for semantic matching by:
 * - trimming whitespace
 * - converting to lowercase
 * - removing all non-alphanumeric characters (hyphens, underscores, dots, etc.)
 */
export function normalizeRepoName(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Keywords representing portfolio documentation / metadata repositories that
 * must NOT be displayed as actual software projects or repository contributions.
 *
 * Excluded categories strictly enforced:
 * 1. Experience (e.g. Experience, experience, experience-history)
 * 2. About Me / Bio (e.g. About-me, about-me, about, aboutme, bio)
 * 3. Resources (e.g. Resources, resources, developer-resources)
 * 4. Technologies / Tech Stack (e.g. Technologies, technologies, technology, tech-stack, techstack)
 * 5. Certifications (e.g. Certifications-, Certifications, Certification, Certificates, credentials)
 * 6. Portfolio / Profile Meta (e.g. Portfolio, portfolio, recommendations, resume, cv)
 */
export const EXCLUDED_PORTFOLIO_PATTERNS = [
  'about',          // matches: About-me, about-me, about, aboutme
  'bio',            // matches: Bio, bio, my-bio
  'experience',     // matches: Experience, experience, experience-history, my-experience
  'resource',       // matches: Resources, resources, developer-resources, my-resources
  'technolog',      // matches: Technologies, technologies, technology, technology-stack
  'techstack',      // matches: tech-stack, techstack, tech_stack
  'certificat',     // matches: Certifications-, Certifications, Certification, Certificates
  'credential',     // matches: Credentials, Credential, credentials
  'recommend',      // matches: Recommendations, recommendations, Recommendations-
  'portfolio',      // matches: Portfolio, portfolio, project-portfolio
  'joshua12hubmax', // matches: Joshua12-hub-max, Joshua12 hub max, joshua12hubmax
] as const;

export const EXCLUDED_EXACT_NAMES = [
  'resume',
  'cv',
  'bio',
  'profile',
  'technologies',
  'resources',
  'experience',
  'certifications',
  'joshua12-hub-max',
  'joshua12 hub max',
  'joshua12hubmax',
] as const;

/**
 * Determines whether a GitHub repository is a portfolio content/metadata repository
 * or user profile repository that should be excluded from Projects and Contributions.
 *
 * Excluded categories:
 * - Experience documentation repository (e.g., Experience)
 * - About-me / bio repository (e.g., About-me)
 * - Resources repository (e.g., Resources)
 * - Technologies repository (e.g., Technologies)
 * - Certifications repository (e.g., Certifications-)
 * - GitHub user profile README repository (e.g., {username}/{username})
 * - Portfolio repository itself (e.g., Portfolio)
 */
export function isPortfolioExcludedRepo(repoName: string, username?: string): boolean {
  if (!repoName) return true;

  const cleanName = repoName.trim().toLowerCase();
  const normalized = normalizeRepoName(repoName);

  // 1. Exclude user profile repository matching the username (e.g. joshuapalero)
  if (username) {
    const cleanUsername = username.trim().toLowerCase();
    const normalizedUsername = normalizeRepoName(username);
    if (cleanName === cleanUsername || normalized === normalizedUsername) {
      return true;
    }
  }

  // 2. Exclude repositories containing metadata keywords
  if (EXCLUDED_PORTFOLIO_PATTERNS.some((pattern) => normalized.includes(pattern))) {
    return true;
  }

  // 3. Exclude exact metadata names (e.g. resume, cv, bio, profile)
  return EXCLUDED_EXACT_NAMES.some((exact) => normalized === exact || cleanName === exact);
}

/**
 * React 19.2 & TanStack Query v5 pure transformation filter:
 * Removes all portfolio metadata, non-project repos, and archived repos.
 */
export function filterProjectRepos<T extends { name: string; archived?: boolean }>(
  repos: readonly T[],
  username?: string
): T[] {
  return repos.filter(
    (repo) => !isPortfolioExcludedRepo(repo.name, username) && !repo.archived
  );
}
