import { Download, ExternalLink, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { SkeletonGroup, Skeleton } from '../ui';
import type { ResumeViewerProps } from './types';
import { RESUME_DEFAULTS } from './types';
import './resume.css';

// ─── Utility ─────────────────────────────────────────────────────────────────

function resolveResumeUrl(override?: string): string {
  if (override && override.trim().length > 0) return override.trim();
  const envUrl =
    typeof import.meta !== 'undefined'
      ? import.meta.env?.VITE_RESUME_URL
      : undefined;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim();
  }
  return RESUME_DEFAULTS.primaryUrl;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

/**
 * ResumeSkeleton — Aurora Scharff zero-CLS placeholder.
 * Accurately mirrors the file card layout to prevent layout shifts.
 */
export function ResumeSkeleton() {
  return (
    <SkeletonGroup label="Loading resume file" className="resume-skeleton-wrap">
      <div className="resume-skeleton-card" aria-hidden="true">
        <Skeleton variant="rounded" width={48} height={56} />
        <div className="resume-skeleton-text">
          <Skeleton variant="text" width={220} height={15} />
          <Skeleton variant="text" width={130} height={12} style={{ marginTop: 4 }} />
        </div>
        <div className="resume-skeleton-actions">
          <Skeleton variant="rounded" width={100} height={36} />
          <Skeleton variant="rounded" width={80} height={36} />
        </div>
      </div>
    </SkeletonGroup>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * ResumeViewer
 *
 * Senior-level, minimalist file-card resume component.
 * Adheres to:
 * - Bryl Lim minimalist typography and spacing
 * - Aurora Scharff zero-CLS sizing and accessible loading
 * - Direct download and open actions without heavy iframe embeds
 */
export default function ResumeViewer({
  sectionNumber = '09',
  sectionTitle = 'Resume',
  resumeUrl,
  onBack,
  onViewDetails,
  className = '',
}: ResumeViewerProps) {
  const resolvedUrl = resolveResumeUrl(resumeUrl);

  return (
    <section
      className={`resume-section ${className}`.trim()}
      aria-label="Resume"
    >
      {/* Back button for dedicated page mode */}
      {onBack && (
        <button
          type="button"
          className="resume-back-link"
          onClick={onBack}
          aria-label="Back to home"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          <span>Back to home</span>
        </button>
      )}

      {/* Header matching experience/certifications style */}
      <div className="resume-section-header">
        <div className="resume-title-group">
          <div className="resume-title-label">
            {sectionNumber && <span>{sectionNumber} —</span>}{' '}
            <span className="resume-word">{sectionTitle}</span>
          </div>
          <div className="resume-subtitle">
            {RESUME_DEFAULTS.ownerName} · {RESUME_DEFAULTS.ownerTitle}
          </div>
        </div>

        {onViewDetails && (
          <button
            type="button"
            onClick={onViewDetails}
            className="resume-details-link"
            title="View resume page"
          >
            <span>view page</span>
            <ArrowRight size={14} className="resume-details-arrow" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* File card */}
      <div className="resume-file-card" role="group" aria-label="Resume file document">
        {/* PDF icon badge */}
        <div className="resume-file-icon-box" aria-hidden="true">
          <FileText size={22} className="resume-file-svg" />
          <span className="resume-file-badge">PDF</span>
        </div>

        {/* File metadata */}
        <div className="resume-file-meta">
          <span className="resume-file-name" title={RESUME_DEFAULTS.filename}>
            {RESUME_DEFAULTS.ownerName} — Resume
          </span>
          <div className="resume-file-details">
            <span>{RESUME_DEFAULTS.fileType}</span>
            <span className="resume-meta-dot" aria-hidden="true">•</span>
            <span>{RESUME_DEFAULTS.fileSize}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="resume-file-actions">
          <a
            href={resolvedUrl}
            download={RESUME_DEFAULTS.filename}
            className="resume-action-btn resume-action-btn--primary"
            aria-label={`Download ${RESUME_DEFAULTS.filename}`}
          >
            <Download size={14} aria-hidden="true" />
            <span>Download</span>
          </a>
          <a
            href={resolvedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="resume-action-btn resume-action-btn--ghost"
            aria-label="Open resume in new tab"
          >
            <ExternalLink size={14} aria-hidden="true" />
            <span>Open</span>
          </a>
        </div>
      </div>
    </section>
  );
}
