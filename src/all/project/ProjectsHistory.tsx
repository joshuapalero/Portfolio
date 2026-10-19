import {
  ArrowLeft,
  ExternalLink,
  Globe,
  RefreshCw,
  AlertCircle,
  FolderGit2,
} from 'lucide-react';
import type { ProjectsHistoryProps } from './types';
import { useSuspenseGithubProjects } from './queries';
import { isPortfolioExcludedRepo } from './repoFilters';
import { Skeleton, SkeletonGroup, HistoryFooter } from '../ui';
import Kinetic from '@/components/registry/kinetic/kinetic';
import { useReducedMotion } from 'motion/react';
import './projects_history.css';

function getLanguageInitials(language: string, name: string): string {
  const lang = language.trim().toLowerCase();
  if (lang === 'typescript') return 'TS';
  if (lang === 'javascript') return 'JS';
  if (lang === 'c#' || lang === 'csharp') return 'C#';
  if (lang === 'c++') return 'C++';
  if (lang === 'python') return 'PY';
  if (lang === 'php') return 'PHP';
  if (lang === 'html') return 'HT';
  if (lang === 'css') return 'CSS';
  if (lang === 'go') return 'GO';
  if (lang === 'rust') return 'RS';
  if (lang === 'shell' || lang === 'bash') return 'SH';

  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
  if (cleanName.length >= 2) {
    return cleanName.slice(0, 2).toUpperCase();
  }
  return language.slice(0, 2).toUpperCase() || 'PR';
}

/**
 * Aurora Scharff Co-located Zero-CLS Projects Skeleton.
 */
export function ProjectsHistorySkeleton() {
  return (
    <SkeletonGroup label="Loading open source projects repository archive" className="proj-history-timeline">
      {[1, 2, 3].map((key, idx) => (
        <div key={key} className="proj-rail-item" aria-hidden="true" style={{ marginBottom: 24 }}>
          <div className="proj-logo-rail">
            <Skeleton variant="rounded" width={48} height={48} />
            {idx !== 2 && <div className="proj-rail-line" style={{ opacity: 0.3 }} />}
          </div>
          <div className="proj-rail-content" style={{ flex: 1 }}>
            <div className="proj-company-header" style={{ marginBottom: 8 }}>
              <Skeleton variant="text" width="40%" height={22} />
              <Skeleton variant="text" width="25%" height={14} />
            </div>
            <div className="proj-inner-rail">
              <div className="proj-role-block">
                <Skeleton variant="text" width="60%" height={16} />
                <Skeleton variant="text" width="90%" height={14} style={{ marginTop: 6 }} />
                <Skeleton variant="text" width="75%" height={14} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </SkeletonGroup>
  );
}

export function ProjectsHistory({
  username = 'joshuapalero',
  token = '',
  onBack,
  subtitle = "a collection of open-source tools, applications, and experiments I've built along the way.",
}: ProjectsHistoryProps) {
  const prefersReducedMotion = useReducedMotion();
  const { cards,  isError, refetch } = useSuspenseGithubProjects({
    username,
    token,
  });

  // Defensive filtering: 100% guarantee that experience, about me, resources, technologies,
  // certifications, and portfolio metadata repos are never displayed in projects history.
  const validProjects = cards.filter((c) => !isPortfolioExcludedRepo(c.name, username));

  return (
    <article className="proj-history-container" aria-label="Full Projects Portfolio">
      {/* Back Button */}
      {onBack && (
        <button
          type="button"
          className="proj-history-back-btn"
          onClick={onBack}
          aria-label="Back to home"
        >
          <ArrowLeft size={16} />
          <span>Back to home</span>
        </button>
      )}

      {/* Header matching Bryl Lim / Experience */}
      <header className="proj-history-header">
        <h1 className="proj-history-title">projects</h1>
        {subtitle && (
          <div className="proj-history-subtitle-wrapper">
            <Kinetic
              text={subtitle}
              jumpHeight={12}
              anticipation={3}
              stiffness={520}
              damping={22}
              mass={0.9}
              windUp={110}
              squash={0.5}
              stagger={28}
              interval={60000}
              trigger="loop"
              split="character"
              shadow={false}
              reducedMotion={prefersReducedMotion ?? false}
              className="proj-history-subtitle"
            />
          </div>
        )}
      </header>

      {/* Skeleton handled by Suspense */}

      {/* Error State */}
      {isError && (
        <div className="proj-state-card" role="alert">
          <AlertCircle size={28} className="proj-state-icon" />
          <h2 className="proj-state-title">Empty</h2>
          <p className="proj-state-message">No projects available.</p>
          <button type="button" className="proj-retry-btn" onClick={() => refetch()}>
            <RefreshCw size={13} />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isError && validProjects.length === 0 && (
        <div className="proj-state-card">
          <FolderGit2 size={32} />
          <h2 className="proj-state-title">Empty</h2>
          <p className="proj-state-message">No projects available.</p>
        </div>
      )}

      {/* ── DUAL VERTICAL RAIL TIMELINE (Matches ExperienceHistory) ── */}
      {!isError && validProjects.length > 0 && (
        <div className="proj-history-timeline" role="list">
          {validProjects.map((project, index) => {
            const isLast = index === validProjects.length - 1;
            const logoLetters = getLanguageInitials(project.language, project.name);
            const metaLine = `${project.language} · Public Repository · ${project.badge}`;

            return (
              <div key={project.id} className="proj-rail-item" role="listitem">
                {/* Left Logo Rail */}
                <div className="proj-logo-rail">
                  <div className="proj-logo-box" aria-hidden="true">
                    {logoLetters}
                  </div>
                  {!isLast && <div className="proj-rail-line" aria-hidden="true" />}
                </div>

                {/* Right Content */}
                <div className="proj-rail-content">
                  <div className="proj-company-header">
                    <h2 className="proj-company-name">
                      <span>{project.name}</span>
                      <span className="proj-links-wrap">
                        {project.liveUrl && (
                          <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="proj-repo-anchor"
                            title="Open Live Preview"
                            aria-label={`Open live preview for ${project.name}`}
                          >
                            <Globe size={14} />
                          </a>
                        )}
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="proj-repo-anchor"
                          title="View on GitHub"
                          aria-label={`View ${project.name} source code on GitHub`}
                        >
                          <ExternalLink size={14} />
                        </a>
                      </span>
                    </h2>
                    <p className="proj-company-type">{metaLine}</p>
                  </div>

                  {/* Inner container with the SECOND vertical line */}
                  <div className="proj-inner-rail">
                    <div className="proj-role-block">
                      {/* Circle node on the inner vertical line */}
                      <span className="proj-inner-dot" aria-hidden="true" />

                      <h3 className="proj-role-title">{project.name}</h3>
                      <p className="proj-duration-meta">
                        GITHUB REPOSITORY · {project.language.toUpperCase()} · OPEN SOURCE
                      </p>

                      {/* Description Paragraph */}
                      <div className="proj-paragraphs">
                        <p>{project.description}</p>
                      </div>

                      {/* Topic & Skill Pills matching Experience Style */}
                      {project.tags && project.tags.length > 0 && (
                        <div
                          className="proj-skills-group"
                          aria-label={`Technologies in ${project.name}`}
                        >
                          {project.tags.map((tag) => (
                            <span key={tag} className="proj-skill-pill">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <HistoryFooter
        externalUrl={`https://github.com/${username}`}
        externalText="View on GitHub"
      />
    </article>
  );
}

export default ProjectsHistory;
