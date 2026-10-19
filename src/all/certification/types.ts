import { z } from 'zod';

/**
 * Zod Schema for a single certification / credential record.
 * Validates entries parsed from joshuapalero/Certifications- README.md.
 */
export const certificationItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).slice(2, 9)),
  year: z.string().default('2025'),
  title: z.string().min(1, 'Title is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  issueDate: z.string().default('2025'),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url().optional().or(z.literal('')),
  skills: z.array(z.string()).default([]),
  description: z.string().default(''),
  badge: z.string().optional(),
  verified: z.boolean().default(true),
});

export const certificationsSchema = z.array(certificationItemSchema);

export type CertificationItem = z.infer<typeof certificationItemSchema>;

/**
 * Result structure returned by the live fetching pipeline.
 */
export interface CertificationDataResult {
  readonly items: readonly CertificationItem[];
  readonly subtitle?: string;
  readonly source: 'github-repo';
  readonly sourceUrl?: string;
  readonly lastUpdated?: string;
}

/**
 * Empty default list adhering to strict requirement:
 * No hardcoded certificate data; data is read exclusively from the GitHub repository README.md.
 */
export const DEFAULT_CERTIFICATIONS: readonly CertificationItem[] = Object.freeze([]);
