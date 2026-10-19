import { useState, useMemo, type MouseEvent } from 'react';
import { ChevronDown } from 'lucide-react';
import type {
  ContributionDay,
  ContributionItem,
  ContributionMonth,
  ContributionsData,
  GithubRepoItem,
  GithubReposProps,
} from './types';
import { useGithubData } from './queries';
import { Skeleton, SkeletonGroup } from '../ui';
import Kinetic from '../../components/registry/kinetic/kinetic';
import './github_repos.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const SHORT_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const generateContributionGrid = (
  year: number,
  contributionsMap: Record<string, ContributionItem> = {},
): { weeks: ContributionDay[][]; months: ContributionMonth[] } => {
  const currentYear = new Date().getFullYear();
  const isCurrentYear = year === currentYear;
  let startDate: Date;

  if (isCurrentYear) {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (6 - currentDayOfWeek));
    startDate = new Date(endOfWeek);
    startDate.setDate(endOfWeek.getDate() - (53 * 7 - 1));
  } else {
    startDate = new Date(year, 0, 1);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);
  }

  const weeks: ContributionDay[][] = [];
  const months: ContributionMonth[] = [];
  let lastMonth = -1;

  for (let w = 0; w < 53; w++) {
    const days: ContributionDay[] = [];
    let weekFirstMonth = -1;

    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + (w * 7 + d));

      const y = cellDate.getFullYear();
      const m = String(cellDate.getMonth() + 1).padStart(2, '0');
      const dayNum = String(cellDate.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${dayNum}`;

      const contrib = contributionsMap[iso] || { count: 0, level: 0, date: iso };
      const formattedDate = `${MONTH_NAMES[cellDate.getMonth()]} ${cellDate.getDate()}, ${cellDate.getFullYear()}`;

      if (cellDate.getDate() <= 7 && weekFirstMonth === -1) {
        weekFirstMonth = cellDate.getMonth();
      }

      days.push({
        dayOfWeek: d,
        date: formattedDate,
        iso,
        level: contrib.level || 0,
        count: contrib.count || 0,
      });
    }

    if (weekFirstMonth !== -1 && weekFirstMonth !== lastMonth) {
      months.push({ name: SHORT_MONTHS[weekFirstMonth] || '', col: w });
      lastMonth = weekFirstMonth;
    }

    weeks.push(days);
  }

  return { weeks, months };
};

/**
 * Aurora Scharff Co-located Zero-CLS GitHub Repos Skeleton Component.
 * Faithfully mirrors the heatmap grid, overview section, and year sidebar layout.
 */
export function GithubReposSkeleton({
  sectionNumber = '03',
  sectionTitle = 'Contributions',
  subtitle,
}: {
  readonly sectionNumber?: string;
  readonly sectionTitle?: string;
  readonly subtitle?: string;
}) {
  return (
    <SkeletonGroup
      label="Loading GitHub contribution activity and repositories"
      className="gh-container"
    >
      <div className="gh-section-header">
        <div className="gh-title-label">
          <span>{sectionNumber} —</span>
          <span className="gh-word">{sectionTitle}</span>
        </div>
      </div>

      {subtitle && (
        <div className="gh-subtitle">
          <Kinetic interval={60000} shadow={false} text={subtitle} />
        </div>
      )}

      <div className="gh-header">
        <Skeleton variant="text" width={280} height={26} />
        <Skeleton variant="rounded" width={150} height={28} />
      </div>

      <div className="gh-main-layout">
        <div className="gh-card">
          <div className="gh-heatmap-section">
            <div className="gh-heatmap-overflow">
              <div className="gh-heatmap-container">
                <div className="gh-skeleton-months-row">
                  {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map((m) => (
                    <Skeleton key={m} variant="text" width={24} height={12} />
                  ))}
                </div>

                <div className="gh-grid-row">
                  <div className="gh-weekdays-column">
                    <span className="gh-weekday-label">Mon</span>
                    <span className="gh-weekday-label">Wed</span>
                    <span className="gh-weekday-label">Fri</span>
                  </div>

                  <div className="gh-graph-weeks">
                    {Array.from({ length: 53 }).map((_, wIdx) => (
                      <div key={wIdx} className="gh-graph-column">
                        {Array.from({ length: 7 }).map((_, dIdx) => (
                          <Skeleton
                            key={dIdx}
                            as="div"
                            variant="rounded"
                            animation="shimmer"
                            className="gh-graph-cell gh-cell-skeleton"
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="gh-heatmap-footer">
                  <Skeleton variant="text" width={180} height={13} />
                  <Skeleton variant="rounded" width={110} height={13} />
                </div>
              </div>
            </div>
          </div>

          <hr className="gh-card-divider" />

          <div className="gh-overview-section">
            <div className="gh-overview-left" style={{ width: '100%' }}>
              <Skeleton variant="text" width={130} height={18} style={{ marginBottom: 12 }} />
              <div className="gh-contributed-box" style={{ width: '100%' }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', width: '100%' }}>
                  <Skeleton variant="rounded" width={140} height={24} />
                  <Skeleton variant="rounded" width={180} height={24} />
                  <Skeleton variant="rounded" width={110} height={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="gh-years-list" aria-hidden="true">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" width={80} height={32} style={{ marginBottom: 6 }} />
          ))}
        </div>
      </div>
    </SkeletonGroup>
  );
}

export function GithubRepos({
  username = 'joshuapalero',
  token,
  sectionNumber = '03',
  sectionTitle = 'Contributions',
  subtitle,
}: GithubReposProps) {
  const [contribQuery, reposQuery] = useGithubData(username, token);

  const isLoading = contribQuery.isPending || reposQuery.isPending;
  const isError = contribQuery.isError || reposQuery.isError;

  const contributionsData = (contribQuery.data ?? {
    total: {},
    contributions: [],
  }) as ContributionsData;

  // Declaratively filtered via TanStack Query's `select` option in queries.ts,
  // excluding Experience, About-me, and Certifications- repositories with structural sharing.
  const repos: GithubRepoItem[] = reposQuery.data ?? [];

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [showSettings, setShowSettings] = useState(false);
  const [includePrivate, setIncludePrivate] = useState(true);
  const [showActivityOverview, setShowActivityOverview] = useState(true);
  const [expandedActivity, setExpandedActivity] = useState(false);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, text: '' });

  const contributionsMap = useMemo(() => {
    const map: Record<string, ContributionItem> = {};
    if (Array.isArray(contributionsData.contributions)) {
      for (const item of contributionsData.contributions) {
        map[item.date] = item;
      }
    }
    return map;
  }, [contributionsData.contributions]);

  const years = useMemo(() => {
    if (contributionsData.total && Object.keys(contributionsData.total).length > 0) {
      return Object.keys(contributionsData.total)
        .map(Number)
        .sort((a, b) => b - a);
    }
    return [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];
  }, [contributionsData.total, currentYear]);

  const { weeks, months } = useMemo(
    () => generateContributionGrid(selectedYear, contributionsMap),
    [selectedYear, contributionsMap],
  );

  const totalContributions = useMemo(() => {
    if (selectedYear === currentYear) {
      const gridSum = weeks.reduce(
        (sum, week) => sum + week.reduce((wSum, day) => wSum + day.count, 0),
        0,
      );
      return gridSum || contributionsData.total?.[selectedYear] || 0;
    }
    if (contributionsData.total && contributionsData.total[selectedYear] !== undefined) {
      return contributionsData.total[selectedYear];
    }
    return weeks.reduce(
      (sum, week) => sum + week.reduce((wSum, day) => wSum + day.count, 0),
      0,
    );
  }, [selectedYear, currentYear, weeks, contributionsData.total]);

  const handleCellMouseEnter = (e: MouseEvent<HTMLDivElement>, day: ContributionDay) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const text =
      day.count > 0
        ? `${day.count} contribution${day.count === 1 ? '' : 's'} on ${day.date}`
        : `No contributions on ${day.date}`;
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      text,
    });
  };

  const handleCellMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const timelineMonth = useMemo(() => {
    if (selectedYear === currentYear) {
      return `${MONTH_NAMES[new Date().getMonth()]} ${selectedYear}`;
    }
    return `December ${selectedYear}`;
  }, [selectedYear, currentYear]);

  if (isLoading) {
    return <GithubReposSkeleton sectionNumber={sectionNumber} sectionTitle={sectionTitle} />;
  }

  if (isError) {
    return (
      <div className="gh-container">
        <div className="gh-section-header">
          <div className="gh-title-label">
            <span>{sectionNumber} —</span>
            <span className="gh-word">{sectionTitle}</span>
          </div>
        </div>
        <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>Empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="gh-container">
      <div className="gh-section-header">
        <div className="gh-title-label">
          <span>{sectionNumber} —</span>
          <span className="gh-word">{sectionTitle}</span>
        </div>
      </div>

      {subtitle && (
        <div className="gh-subtitle">
          <Kinetic interval={60000} shadow={false} text={subtitle} />
        </div>
      )}

      {tooltip.visible && (
        <div className="gh-tooltip" style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}>
          {tooltip.text}
        </div>
      )}

      <div className="gh-header">
        <h2 className="gh-contributions-count">
          {totalContributions} contributions in {selectedYear === currentYear ? 'the last year' : selectedYear}
        </h2>

        <div className="gh-settings-wrapper">
          <button
            type="button"
            className="gh-settings-button"
            onClick={() => setShowSettings((prev) => !prev)}
            aria-expanded={showSettings}
          >
            <span>Contribution settings</span>
            <ChevronDown size={14} />
          </button>

          {showSettings && (
            <ul className="gh-settings-dropdown" role="menu">
              <li className="gh-dropdown-header">Contribution settings</li>
              <li
                className="gh-dropdown-item"
                role="menuitemcheckbox"
                aria-checked={includePrivate}
                tabIndex={0}
                onClick={() => setIncludePrivate((p) => !p)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIncludePrivate((p) => !p);
                  }
                }}
              >
                <span>Private contributions</span>
                <input
                  type="checkbox"
                  checked={includePrivate}
                  readOnly
                  className="gh-dropdown-checkbox"
                />
              </li>
              <li
                className="gh-dropdown-item"
                role="menuitemcheckbox"
                aria-checked={showActivityOverview}
                tabIndex={0}
                onClick={() => setShowActivityOverview((a) => !a)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setShowActivityOverview((a) => !a);
                  }
                }}
              >
                <span>Activity overview</span>
                <input
                  type="checkbox"
                  checked={showActivityOverview}
                  readOnly
                  className="gh-dropdown-checkbox"
                />
              </li>
            </ul>
          )}
        </div>
      </div>

      <div className="gh-main-layout">
        <div className="gh-card">
          <div className="gh-heatmap-section">
            <div className="gh-heatmap-overflow">
              <div className="gh-heatmap-container">
                <div className="gh-months-row">
                  {months.map((m, idx) => (
                    <span
                      key={idx}
                      className="gh-month-label"
                      style={{ left: `${(m.col / 53) * 100}%` }}
                    >
                      {m.name}
                    </span>
                  ))}
                </div>

                <div className="gh-grid-wrapper">
                  <div className="gh-weekdays-column">
                    <span className="gh-weekday-label">Mon</span>
                    <span className="gh-weekday-label">Wed</span>
                    <span className="gh-weekday-label">Fri</span>
                  </div>

                  <div className="gh-graph-weeks">
                    {weeks.map((week, wIdx) => (
                      <div key={wIdx} className="gh-graph-column">
                        {week.map((day, dIdx) => (
                          <div
                            key={dIdx}
                            className={`gh-graph-cell gh-cell-lvl-${day.level}`}
                            onMouseEnter={(e) => handleCellMouseEnter(e, day)}
                            onMouseLeave={handleCellMouseLeave}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="gh-heatmap-footer">
                  <a
                    href="https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-github-profile/managing-contribution-settings-on-your-profile/why-are-my-contributions-not-showing-up-on-my-profile"
                    target="_blank"
                    rel="noreferrer"
                    className="gh-learn-link"
                  >
                    Learn how we count contributions
                  </a>

                  <div className="gh-legend">
                    <span className="gh-legend-label">Less</span>
                    <div className="gh-legend-cells">
                      <div className="gh-graph-cell gh-cell-lvl-0" />
                      <div className="gh-graph-cell gh-cell-lvl-1" />
                      <div className="gh-graph-cell gh-cell-lvl-2" />
                      <div className="gh-graph-cell gh-cell-lvl-3" />
                      <div className="gh-graph-cell gh-cell-lvl-4" />
                    </div>
                    <span className="gh-legend-label">More</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showActivityOverview && <hr className="gh-card-divider" />}

          {showActivityOverview && (
            <div className="gh-overview-section">
              <div className="gh-overview-left">
                <h3 className="gh-overview-title">Activity overview</h3>
                <div className="gh-contributed-box">
                  <svg
                    aria-hidden="true"
                    height="16"
                    viewBox="0 0 16 16"
                    version="1.1"
                    width="16"
                    className="gh-repo-icon"
                    fill="currentColor"
                  >
                    <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z" />
                  </svg>

                  <div className="gh-contributed-content">
                    <span className="gh-contributed-label">Contributed to </span>
                    {repos.length > 0 ? (
                      repos.map((repo, idx) => (
                        <span key={repo.id || repo.name}>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="gh-repo-link"
                          >
                            {repo.full_name || repo.name}
                          </a>
                          {idx < repos.length - 1 && (
                            <>
                              {', '}
                              <br />
                            </>
                          )}
                        </span>
                      ))
                    ) : (
                      <span>Empty</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="gh-overview-right">
                <svg viewBox="0 0 280 150" className="gh-quadrant-chart">
                  <text x="150" y="15" textAnchor="middle" className="gh-chart-label">
                    Code review
                  </text>
                  <line x1="150" y1="25" x2="150" y2="125" className="gh-chart-axis-line" />
                  <text x="150" y="142" textAnchor="middle" className="gh-chart-label">
                    Pull requests
                  </text>
                  <line x1="70" y1="75" x2="230" y2="75" className="gh-chart-axis-line" />
                  <text x="238" y="79" textAnchor="start" className="gh-chart-label">
                    Issues
                  </text>
                  <line x1="150" y1="75" x2="70" y2="75" className="gh-chart-active-line" />
                  <circle cx="70" cy="75" r="4.5" className="gh-chart-dot" />
                  <text
                    x="58"
                    y="71"
                    textAnchor="end"
                    className="gh-chart-label gh-chart-commits-bold"
                  >
                    100%
                  </text>
                  <text
                    x="58"
                    y="86"
                    textAnchor="end"
                    className="gh-chart-label gh-chart-commits-bold"
                  >
                    Commits
                  </text>
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="gh-year-sidebar">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              className={`gh-year-button ${selectedYear === year ? 'active' : ''}`}
              onClick={() => setSelectedYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className="gh-activity-section">
        <h3 className="gh-activity-header-title">Contribution activity</h3>
        <div className="gh-timeline-month-divider">
          <span className="gh-timeline-month-name">{timelineMonth}</span>
          <hr className="gh-timeline-line" />
        </div>

        {totalContributions === 0 || !expandedActivity ? (
          <div className="gh-empty-activity">
            {username} has no activity yet for this period.
          </div>
        ) : (
          <div className="gh-activity-list">
            <div className="gh-activity-item">
              <div>
                <div className="gh-activity-item-title">
                  Created {totalContributions} contribution
                  {totalContributions === 1 ? '' : 's'} in {repos.length}{' '}
                  {repos.length === 1 ? 'repository' : 'repositories'}
                </div>
                {repos.length > 0 && (
                  <div className="gh-activity-item-desc">
                    {repos.map((r) => r.full_name || r.name).join(', ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="gh-load-more-btn"
          onClick={() => setExpandedActivity((prev) => !prev)}
        >
          {expandedActivity ? 'Show less activity' : 'Show more activity'}
        </button>
      </div>
    </div>
  );
}

export default GithubRepos;
