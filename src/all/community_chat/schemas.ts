import { z } from 'zod';

/**
 * Zod Schemas for Community Chat Data Validation.
 * Adheres strictly to Tanner Linsley / TanStack 2026 data-layer and Zod standards.
 */

// Strip zero-width, bidirectional override, and non-printable control characters
export function sanitizeText(text: string): string {
  return text
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF\u202A-\u202E]/g, '')
    .trim();
}

export const chatMessageSchema = z.object({
  id: z.number().int().nonnegative(),
  client_id: z.string().min(1).max(128),
  name: z.string().min(1).max(40),
  message: z.string().min(1).max(500),
  location: z.string().max(100).optional(),
  device: z.string().max(50).optional(),
  verified: z.boolean().optional().default(false),
  at: z.string().min(10),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const chatSendPayloadSchema = z.object({
  client_id: z.string().trim().min(1, 'Client ID is required').max(128),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(40, 'Name cannot exceed 40 characters')
    .transform(sanitizeText),
  message: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .max(500, 'Message cannot exceed 500 characters')
    .transform(sanitizeText),
  location: z.string().trim().max(100).optional(),
  device: z.string().trim().max(50).optional(),
  admin_key: z.string().optional(),
});

export type ChatSendPayload = z.infer<typeof chatSendPayloadSchema>;

export const chatResponseSchema = z.object({
  success: z.boolean(),
  total: z.number().int().nonnegative(),
  messages: z.array(chatMessageSchema),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;

export const chatSendResponseSchema = z.object({
  success: z.boolean(),
  message: chatMessageSchema.optional(),
  reason: z.enum(['link', 'offensive', 'cooldown', 'reserved_name']).optional(),
  error: z.string().optional(),
});

export type ChatSendResponse = z.infer<typeof chatSendResponseSchema>;

export const chatIdentityPayloadSchema = z.object({
  client_id: z.string().trim().min(1).max(128),
  name: z.string().trim().min(1).max(40).transform(sanitizeText),
});

export type ChatIdentityPayload = z.infer<typeof chatIdentityPayloadSchema>;

export const chatIdentityResponseSchema = z.object({
  success: z.boolean(),
  name: z.string().optional(),
  error: z.string().optional(),
});

export type ChatIdentityResponse = z.infer<typeof chatIdentityResponseSchema>;
