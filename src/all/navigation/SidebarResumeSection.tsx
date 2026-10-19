import { Link } from '@tanstack/react-router';
import { FileText, ArrowUpRight } from 'lucide-react';

export interface SidebarResumeSectionProps {
  readonly onActionClick?: () => void;
  readonly className?: string;
}

/**
 * SidebarResumeSection
 *
 * Dedicated, pure monochrome Resume section for the Quick Hub sidebar.
 * Enables recruiters and HR to immediately find, inspect, and navigate
 * to the dedicated Resume page (/resume) with zero color distractions.
 */
export default function SidebarResumeSection({
  onActionClick,
  className = '',
}: SidebarResumeSectionProps) {
  return (
    <div className={`nav-sidebar-section nav-sidebar-resume-section ${className}`.trim()}>
      <div className="nav-sidebar-section-header">
        <span className="nav-sidebar-section-label">Resume</span>
      </div>

      <Link
        to="/resume"
        className="nav-work-card nav-work-card-link nav-resume-card"
        onClick={onActionClick}
        aria-label="Review and download resume (Joshua Pasacay Palero)"
      >
        <div className="nav-work-card-icon-box" aria-hidden="true">
          <FileText size={18} />
        </div>

        <div className="nav-work-card-content">
          <div className="nav-work-card-meta">
            <span className="nav-work-card-tag">curriculum vitae</span>
          </div>
          <span className="nav-work-card-text">Joshua Pasacay Palero</span>
          <span className="nav-resume-subtext">PDF • 276 KB</span>
        </div>

        <ArrowUpRight size={16} className="nav-work-card-chevron" aria-hidden="true" />
      </Link>
    </div>
  );
}
