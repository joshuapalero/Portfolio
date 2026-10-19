import { z } from 'zod';
import {
  validateNameString,
  validateRoleString,
  validateCommentString,
  VERIFIED_ROLES,
} from './validation';

export {
  validateNameString,
  validateRoleString,
  validateCommentString,
  VERIFIED_ROLES,
};

/**
 * Zod Schema for strict input validation in React 19 Form Actions.
 * Enforces enterprise safety rules, complete names, valid roles, and grammar quality.
 */
export const newRecommendationInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(4, 'Name must be at least 4 characters')
    .max(60, 'Name cannot exceed 60 characters')
    .superRefine((val, ctx) => {
      const err = validateNameString(val);
      if (err) {
        ctx.addIssue({
          code: "custom",
          message: err,
        });
      }
    }),
  role: z
    .string()
    .trim()
    .min(3, 'Role must be at least 3 characters')
    .max(120, 'Role cannot exceed 120 characters')
    .superRefine((val, ctx) => {
      const err = validateRoleString(val);
      if (err) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: err,
        });
      }
    }),
  description: z
    .string()
    .trim()
    .min(30, 'Recommendation must be at least 30 characters')
    .max(50000, 'Recommendation cannot exceed 50,000 characters')
    .superRefine((val, ctx) => {
      const err = validateCommentString(val);
      if (err) {
        ctx.addIssue({
          code: "custom",
          message: err,
        });
      }
    }),
  avatarIndex: z.coerce.number().int().min(0).max(10).optional(),
});

export type NewRecommendationPayload = z.infer<typeof newRecommendationInputSchema>;

/**
 * Zod Schema for a single recommendation comment.
 */
export const recommendationCommentSchema = z.object({
  id: z.string().default(() => `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
  name: z.string().trim().min(2).max(60),
  role: z.string().trim().min(2).max(120),
  description: z.string().trim().min(5).max(50000),
  date: z.string().default(() => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date());
  }),
  createdAt: z.number().default(() => Date.now()),
  isOptimistic: z.boolean().optional(),
  avatarIndex: z.number().int().min(0).optional(),
});

export const recommendationsSchema = z.array(recommendationCommentSchema);

export type RecommendationComment = z.infer<typeof recommendationCommentSchema>;

/**
 * Aurora Scharff / TanStack Query v5 Hierarchical Query Key Factory.
 */
export const recommendationKeys = {
  all: ['recommendations'] as const,
  lists: () => [...recommendationKeys.all, 'list'] as const,
};

/**
 * React 19 useActionState form contract.
 */
export interface RecommendationFormState {
  readonly status: 'idle' | 'success' | 'error';
  readonly message?: string;
  readonly fieldErrors?: {
    readonly name?: string;
    readonly role?: string;
    readonly description?: string;
    readonly avatarIndex?: string;
  };
  readonly values: {
    readonly name: string;
    readonly role: string;
    readonly description: string;
    readonly avatarIndex?: number;
  };
  readonly timestamp: number;
}

export const INITIAL_FORM_STATE: RecommendationFormState = Object.freeze({
  status: 'idle',
  values: {
    name: '',
    role: '',
    description: '',
  },
  timestamp: 0,
});
