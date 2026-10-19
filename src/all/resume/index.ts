/**
 * Resume feature barrel export.
 * Follows the project's existing index.ts convention (see experience/index.ts, certification/index.ts).
 */
export { default as ResumeViewer, ResumeSkeleton } from './resume';
export type { ResumeViewerProps, ResumeConfig } from './types';
export { RESUME_DEFAULTS, resumeConfigSchema } from './types';
