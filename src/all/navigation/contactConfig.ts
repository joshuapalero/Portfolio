/**
 * Contact & Schedule Configuration Factory
 *
 * Senior-level centralized configuration provider for:
 * 1. Primary contact email & RFC 6068 compliant mailto URL builder with pre-filled templates.
 * 2. Schedule a Call (Calendly / Cal.com / Google Calendar) direct booking URL resolution.
 * 3. Clipboard copy utilities with safe cross-browser fallbacks.
 */

export interface ContactConfig {
  readonly email: string;
  readonly scheduleCallUrl: string;
  readonly defaultSubject: string;
  readonly defaultBody: string;
  readonly callLabel: string;
  readonly callText: string;
  readonly callSubtext: string;
  readonly emailLabel: string;
}

export const DEFAULT_CONTACT_EMAIL = 'joshuapalero111@gmail.com';
export const DEFAULT_SCHEDULE_CALL_URL = 'https://calendly.com/joshuapalero111';
export const DEFAULT_CONTACT_SUBJECT = 'Project Inquiry / Collaboration - Joshua Palero';
export const DEFAULT_CONTACT_BODY_TEMPLATE = `Hi Joshua,

I would like to discuss a potential project/opportunity with you.

• Project Scope / Role:
• Estimated Timeline:
• Budget / Engagement Type:

Looking forward to connecting!`;

/**
 * Builds an RFC 6068 compliant mailto: URL with strictly percent-encoded query fields.
 *
 * Uses encodeURIComponent to guarantee %20 for spaces and %0A for line breaks,
 * avoiding the URLSearchParams '+' conversion which some desktop and mobile mail clients reject.
 */
export function buildMailtoUrl(
  email: string = DEFAULT_CONTACT_EMAIL,
  options?: { subject?: string; body?: string }
): string {
  const cleanEmail = email.trim();
  const queryParams: string[] = [];

  if (options?.subject && options.subject.trim().length > 0) {
    queryParams.push(`subject=${encodeURIComponent(options.subject.trim())}`);
  }

  if (options?.body && options.body.trim().length > 0) {
    queryParams.push(`body=${encodeURIComponent(options.body.trim())}`);
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  return `mailto:${cleanEmail}${queryString}`;
}

/**
 * Builds a direct web-based Gmail compose URL with prefilled recipient, subject, and body.
 * Works seamlessly in any browser without requiring native OS desktop mail clients.
 */
export function buildGmailComposeUrl(
  email: string = DEFAULT_CONTACT_EMAIL,
  options?: { subject?: string; body?: string }
): string {
  const cleanEmail = email.trim();
  const params: string[] = [`to=${encodeURIComponent(cleanEmail)}`];
  if (options?.subject) params.push(`su=${encodeURIComponent(options.subject)}`);
  if (options?.body) params.push(`body=${encodeURIComponent(options.body)}`);
  return `https://mail.google.com/mail/?view=cm&fs=1&${params.join('&')}`;
}

/**
 * Builds a direct Outlook.com / Office365 web compose URL.
 */
export function buildOutlookComposeUrl(
  email: string = DEFAULT_CONTACT_EMAIL,
  options?: { subject?: string; body?: string }
): string {
  const cleanEmail = email.trim();
  const params: string[] = [`to=${encodeURIComponent(cleanEmail)}`];
  if (options?.subject) params.push(`subject=${encodeURIComponent(options.subject)}`);
  if (options?.body) params.push(`body=${encodeURIComponent(options.body)}`);
  return `https://outlook.live.com/mail/0/deeplink/compose?${params.join('&')}`;
}

/**
 * Builds a direct Yahoo Mail web compose URL.
 */
export function buildYahooComposeUrl(
  email: string = DEFAULT_CONTACT_EMAIL,
  options?: { subject?: string; body?: string }
): string {
  const cleanEmail = email.trim();
  const params: string[] = [`to=${encodeURIComponent(cleanEmail)}`];
  if (options?.subject) params.push(`subj=${encodeURIComponent(options.subject)}`);
  if (options?.body) params.push(`body=${encodeURIComponent(options.body)}`);
  return `https://compose.mail.yahoo.com/?${params.join('&')}`;
}

/**
 * Formats a standardized plain-text email draft containing recipient, subject, and body.
 */
export function buildFullDraftText(
  email: string = DEFAULT_CONTACT_EMAIL,
  options?: { subject?: string; body?: string }
): string {
  const lines: string[] = [`To: ${email.trim()}`];
  if (options?.subject && options.subject.trim().length > 0) {
    lines.push(`Subject: ${options.subject.trim()}`);
  }
  if (options?.body && options.body.trim().length > 0) {
    lines.push('', options.body.trim());
  }
  return lines.join('\n');
}

/**
 * Validates whether a provided scheduling link is an actionable calendar URL
 * rather than an unconfigured generic homepage.
 */
export function isActionableBookingUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) return false;

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();

    // Check if it's Calendly or Cal.com without a specific user/event path
    if (hostname === 'calendly.com' || hostname === 'www.calendly.com') {
      const pathname = parsed.pathname.replace(/\/+$/, '');
      return pathname.length > 1; // Must have path beyond '/'
    }

    if (hostname === 'cal.com' || hostname === 'www.cal.com') {
      const pathname = parsed.pathname.replace(/\/+$/, '');
      return pathname.length > 1;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Safely copies text to the system clipboard using navigator.clipboard with fallback
 * to legacy document.execCommand('copy') for older browsers or non-secure contexts.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // Modern Clipboard API
  if (navigator?.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback for non-https or older webviews
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    textArea.setAttribute('aria-hidden', 'true');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Resolves contact and scheduling configuration by reading environment variables
 * with production-grade defaults.
 */
export function getContactConfig(): ContactConfig {
  const envEmail = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_CONTACT_EMAIL : undefined;
  const envCallUrl =
    typeof import.meta !== 'undefined'
      ? import.meta.env?.VITE_SCHEDULE_CALL_URL || import.meta.env?.VITE_CALENDLY_URL
      : undefined;
  const envSubject = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_CONTACT_SUBJECT : undefined;
  const envBody = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_CONTACT_BODY : undefined;

  return {
    email: envEmail?.trim() || DEFAULT_CONTACT_EMAIL,
    scheduleCallUrl: envCallUrl?.trim() || DEFAULT_SCHEDULE_CALL_URL,
    defaultSubject: envSubject?.trim() || DEFAULT_CONTACT_SUBJECT,
    defaultBody: envBody?.trim() || DEFAULT_CONTACT_BODY_TEMPLATE,
    callLabel: 'call',
    callText: 'schedule a call',
    callSubtext: '15–30 min',
    emailLabel: 'email',
  };
}
