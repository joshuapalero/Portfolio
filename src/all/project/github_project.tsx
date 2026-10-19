import type { MouseEvent } from 'react';
import { ArrowRight, ExternalLink, Code2, Globe, RefreshCw } from 'lucide-react';
import type { GithubProjectProps, CardProject } from './types';
import { useGithubProjects } from './queries';
import { isPortfolioExcludedRepo } from './repoFilters';
import { SpotlightCard } from './SpotlightCard';
import { Skeleton, SkeletonGroup } from '../ui';
import './github_project.css';

interface ProjectLayerProps {
  project: CardProject;
}

function ProjectLayerContent({ project }: ProjectLayerProps) {
  return (
    <>
      <div className="deck-badges">
        <span className="deck-badge-highlight">
          <span className="deck-bracket">(</span>
          {project.badge}
          <span className="deck-bracket">)</span>
        </span>
        {project.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="deck-badge-secondary">
            {tag}
          </span>
        ))}
      </div>

      <div className="deck-header">
        <div className="deck-app-icon mono-badge">
          <span>{project.language}</span>
        </div>
        <h3 className="deck-app-title" title={project.name}>
          {project.name}
        </h3>
      </div>

      <p className="deck-desc">{project.description}</p>

      <div className="deck-actions" onClick={(e) => e.stopPropagation()}>
        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="store-btn"
          >
            <Globe size={13} />
            <div className="store-text-group">
              <span className="store-sub">Live Preview</span>
              <span className="store-main">Demo</span>
            </div>
          </a>
        ) : (
          <a
            href={project.repoUrl}
            target="_blank"
            rel="noreferrer"
            className="store-btn"
          >
            <ExternalLink size={13} />
            <div className="store-text-group">
              <span className="store-sub">Direct Link</span>
              <span className="store-main">View Code</span>
            </div>
          </a>
        )}
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noreferrer"
          className="store-btn"
        >
          <Code2 size={13} />
          <div className="store-text-group">
            <span className="store-sub">View on</span>
            <span className="store-main">GitHub</span>
          </div>
        </a>
      </div>
    </>
  );
}

export function GithubProject({
  username = 'joshuapalero',
  token = '',
  sectionNumber = '02',
  sectionTitle = 'Projects',
  onViewAllProjects,
}: GithubProjectProps) {
  const { cards, isPending, isError, refetch } = useGithubProjects({
    username,
    token,
  });

  // Defensive filtering: 100% guarantee that experience, about me, resources, technologies,
  // certifications, and portfolio metadata repos are never displayed.
  const validProjects = cards.filter((c) => !isPortfolioExcludedRepo(c.name, username));
  const total = validProjects.length;

  const handleAllProjectsClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (onViewAllProjects) {
      e.preventDefault();
      onViewAllProjects();
    }
  };

  // Maps projects consecutively across the 5 layers in sequence ("sunod-sunod"):
  // Layer 5 (front surface): Project 1
  // Layer 4: Project 2
  // Layer 3: Project 3
  // Layer 2: Project 4
  // Layer 1: Project 5
  const getProjectAt = (index: number): CardProject | undefined => {
    if (total === 0) return undefined;
    return validProjects[index % total];
  };

  return (
    <section className="projects-section" aria-label="Projects">
      <div className="projects-header">
        <div className="projects-title-label">
          <span>{sectionNumber} —</span>
          <span className="projects-word">{sectionTitle}</span>
        </div>
        <a
          href="/projects"
          onClick={handleAllProjectsClick}
          className="projects-all-link"
          title="View all projects"
        >
          <span>see project</span>
          <ArrowRight size={14} />
        </a>
      </div>

      {/* Loading state: Accessible zero-CLS Spotlight Deck Card Skeleton */}
      {isPending && (
        <SkeletonGroup label="Loading GitHub projects showcase" className="deck-stage">
          <div className="deck-container">
            <div className="deck-card active-card" aria-hidden="true">
              <div className="deck-card-inner">
                <div className="deck-badges" style={{ display: 'flex', gap: '8px' }}>
                  <Skeleton variant="rounded" width={90} height={22} />
                  <Skeleton variant="rounded" width={55} height={22} />
                  <Skeleton variant="rounded" width={65} height={22} />
                </div>
                <div className="deck-header" style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Skeleton variant="circular" width={26} height={26} />
                  <Skeleton variant="text" width="60%" height={22} style={{ margin: 0 }} />
                </div>
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Skeleton variant="text" width="100%" height={14} />
                  <Skeleton variant="text" width="80%" height={14} />
                </div>
                <div className="deck-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                  <Skeleton variant="rounded" width={115} height={38} />
                  <Skeleton variant="rounded" width={115} height={38} />
                </div>
              </div>
            </div>
          </div>
        </SkeletonGroup>
      )}

      {/* Error state */}
      {isError && (
        <div className="deck-stage">
          <div className="deck-container">
            <div className="deck-card active-card">
              <div className="deck-card-inner">
                <div className="deck-badges">
                  <span className="deck-badge-highlight">Empty</span>
                </div>
                <div className="deck-header">
                  <div className="deck-app-icon dark-bull">
                    <span>📦</span>
                  </div>
                  <h3 className="deck-app-title">Empty</h3>
                </div>
                <p className="deck-desc">No projects available.</p>
                <div className="deck-actions">
                  <button type="button" className="store-btn" onClick={() => refetch()}>
                    <RefreshCw size={13} />
                    <div className="store-text-group">
                      <span className="store-sub">Click to</span>
                      <span className="store-main">Retry</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Single Animated Card with all projects on consecutive layers ("sunod-sunod") */}
      {!isPending && !isError && total > 0 && (
        <div className="deck-stage">
          <div className="deck-container">
            <SpotlightCard
              className="deck-card active-card"
              layer5Content={getProjectAt(0) && <ProjectLayerContent project={getProjectAt(0)!} />}
              layer4Content={getProjectAt(1) && <ProjectLayerContent project={getProjectAt(1)!} />}
              layer3Content={getProjectAt(2) && <ProjectLayerContent project={getProjectAt(2)!} />}
              layer2Content={getProjectAt(3) && <ProjectLayerContent project={getProjectAt(3)!} />}
              layer1Content={getProjectAt(4) && <ProjectLayerContent project={getProjectAt(4)!} />}
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isPending && !isError && total === 0 && (
        <div className="deck-stage">
          <div className="deck-container">
            <div className="deck-card active-card">
              <div className="deck-card-inner">
                <div className="deck-badges">
                  <span className="deck-badge-highlight">Empty</span>
                </div>
                <div className="deck-header">
                  <div className="deck-app-icon dark-bull">
                    <span>📦</span>
                  </div>
                  <h3 className="deck-app-title">Empty</h3>
                </div>
                <p className="deck-desc">No projects available.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default GithubProject;
