/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHUB_TOKEN?: string;
  readonly VITE_GITHUB_USERNAME?: string;
  /** URL of the Cloudflare Worker proxy (e.g., https://facebook-proxy.xxx.workers.dev) */
  readonly VITE_FB_WORKER_URL?: string;
  /** Dedicated or unified Cloudflare Worker URL for GitHub and APIs */
  readonly VITE_GITHUB_WORKER_URL?: string;
  readonly VITE_WORKER_URL?: string;
  /** Primary contact and freelance inquiry email */
  readonly VITE_CONTACT_EMAIL?: string;
  /** Scheduling / Calendly / Cal.com booking URL */
  readonly VITE_SCHEDULE_CALL_URL?: string;
  readonly VITE_CALENDLY_URL?: string;
  /** Default inquiry subject for mailto */
  readonly VITE_CONTACT_SUBJECT?: string;
  /** Default inquiry body template for mailto */
  readonly VITE_CONTACT_BODY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
