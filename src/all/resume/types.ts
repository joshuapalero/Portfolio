import { z } from 'zod';

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

/**
 * Resume configuration schema with production-safe defaults and immutability.
 */
export const resumeConfigSchema = z.object({
  primaryUrl: z.string().min(1),
  legacyUrl: z.string().min(1),
  filename: z.string().min(1),
  ownerName: z.string().min(1),
  ownerTitle: z.string().min(1),
  fileSize: z.string().min(1),
  fileType: z.string().min(1),
});

export type ResumeConfig = z.infer<typeof resumeConfigSchema>;

// ─── Component Props ──────────────────────────────────────────────────────────

/**
 * Senior-level typed props for ResumeViewer.
 * Follows Aurora Scharff and Tanner Linsley conventions:
 * - Readonly fields for defensive programming
 * - Optional navigation callbacks
 * - Explicit layout configurability
 */
export interface ResumeViewerProps {
  /** Section number index (defaults to '09') */
  readonly sectionNumber?: string;
  /** Section title label (defaults to 'Resume') */
  readonly sectionTitle?: string;
  /** Override the resolved resume URL (e.g., from env). Falls back to RESUME_DEFAULTS.primaryUrl. */
  readonly resumeUrl?: string;
  /** Optional back navigation callback (rendered on dedicated /resume page) */
  readonly onBack?: () => void;
  /** Optional view details callback */
  readonly onViewDetails?: () => void;
  /** Additional CSS class applied to the root element */
  readonly className?: string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

/**
 * Production-safe resume defaults.
 * Uses the actual resume in /public ("Joshua Pasacay Palero Resume.pdf") with /resume.pdf fallback.
 */
export const RESUME_DEFAULTS = {
  primaryUrl: '/Joshua_Pasacay_Palero Resume.pdf',
  legacyUrl: '/resume.pdf',
  filename: 'Joshua_Pasacay_Palero_Resume.pdf',
  ownerName: 'Joshua Pasacay Palero',
  ownerTitle: 'Software Engineer',
  fileSize: '5 KB',
  fileType: 'PDF Document',
} as const satisfies Record<string, string>;
