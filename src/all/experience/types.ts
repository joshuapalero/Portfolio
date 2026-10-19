import { z } from 'zod';

/**
 * Zod Schema for a single experience record.
 * Validates dynamic entries parsed exclusively from joshuapalero/Experience README.md.
 */
export const experienceItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).slice(2, 9)),
  year: z.string().default('2025'),
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  companyUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  period: z.string().min(1, 'Period is required'),
  tag: z.string().optional(),
  project: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  achievements: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  rawMeta: z.array(z.string()).default([]),
});

export const experiencesSchema = z.array(experienceItemSchema);

export type ExperienceItem = z.infer<typeof experienceItemSchema>;

/**
 * Result structure returned by the live fetching pipeline.
 */
export interface ExperienceDataResult {
  readonly items: readonly ExperienceItem[];
  readonly subtitle?: string;
  readonly source: 'github-repo';
  readonly sourceUrl?: string;
  readonly lastUpdated?: string;
}

/**
 * Empty default list adhering to strict requirement:
 * No hardcoded experience data; data is read exclusively from the GitHub repository README.md.
 */
export const DEFAULT_EXPERIENCES: readonly ExperienceItem[] = Object.freeze([]);
