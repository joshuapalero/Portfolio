import type { FC, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export const NextJsIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 180 180"
    width={width}
    height={height}
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <mask
      height="180"
      id="mask0_next"
      maskUnits="userSpaceOnUse"
      width="180"
      x="0"
      y="0"
      style={{ maskType: 'alpha' }}
    >
      <circle cx="90" cy="90" fill="currentColor" r="90" />
    </mask>
    <g mask="url(#mask0_next)">
      <circle cx="90" cy="90" data-circle="true" fill="currentColor" r="90" />
      <path
        d="M149.508 157.52L69.142 54H54V125.97H66.1136V69.3836L139.999 164.845C143.333 162.614 146.509 160.165 149.508 157.52Z"
        fill="var(--bg-page, #ffffff)"
      />
      <rect
        fill="var(--bg-page, #ffffff)"
        height="72"
        width="12"
        x="115"
        y="54"
      />
    </g>
  </svg>
);

export const TanStackIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

export const ReactIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="-11.5 -10.23174 23 20.46348"
    width={width}
    height={height}
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <circle cx="0" cy="0" r="2.05" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

export const TypeScriptIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path
      d="M11.5 13.5H9.2v5.5H7V13.5H4.8V11.8h6.7v1.7zm7.5 2c-.2-.9-.8-1.5-1.9-1.9l-.7-.3c-.5-.2-.8-.4-.8-.7 0-.3.2-.5.6-.5.5 0 .8.2 1.1.5l1.6-1.1c-.6-.9-1.5-1.3-2.7-1.3-1.8 0-3 1-3 2.5 0 1.1.6 1.8 1.9 2.4l.8.3c.7.3 1 .5 1 .9 0 .4-.3.6-.8.6-.7 0-1.1-.3-1.3-.8l-1.7 1c.5 1.1 1.5 1.6 3 1.6 2 0 3.2-1.1 3.2-2.6 0-.7-.2-1.3-.6-1.6z"
      fill="currentColor"
    />
  </svg>
);

export const TailwindIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" />
  </svg>
);

export const ShadcnIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 256 256"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="20"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <line x1="208" y1="128" x2="128" y2="208" />
    <line x1="192" y1="40" x2="40" y2="192" />
  </svg>
);

export const ViteIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M22.5 4.3 12.8 22.8a.9.9 0 0 1-1.6 0L1.5 4.3a.9.9 0 0 1 .8-1.3h19.4a.9.9 0 0 1 .8 1.3Z"
      opacity="0.35"
    />
    <path d="m14 2.5-6.5 12h4.5l-2.5 7 8.5-12h-4.5l3.5-7h-3z" />
  </svg>
);

export const BunIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M12 3c-4.8 0-9 3-10 7.5-.8 3.5.5 7 3 9 2.5 2 6 2 9 1 4-1 7-4 7.5-8.5.5-4-1.5-7.5-4.5-9-1.5-.7-3.3-1-5-1Z" />
    <circle cx="9.5" cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="13" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const SupabaseIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M21.362 9.354H12V.3a.3.3 0 0 0-.523-.2L2.3 10.748a.3.3 0 0 0 .223.498H12v9.054a.3.3 0 0 0 .523.2l9.177-10.648a.3.3 0 0 0-.223-.498z" />
  </svg>
);

export const VercelIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="m12 1.5 11.5 20H.5L12 1.5z" />
  </svg>
);

export const MdnIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="m11.15 4.27-2.3 15.46H6.18L4 8.78l-2.18 10.95H0L2.3 4.27h3.14l2.09 10.22 2.05-10.22h1.57zm4.33 2.15a1.86 1.86 0 1 1-1.86 1.86 1.86 1.86 0 0 1 1.86-1.86zm0 9.07a1.86 1.86 0 1 1-1.86 1.86 1.86 1.86 0 0 1 1.86-1.86zm8.52-6.95v11.19h-2.58v-6.95c0-1.86-.74-2.5-2.09-2.5a2.53 2.53 0 0 0-2.3 1.63v7.82h-2.58V4.27h2.58v4.94a4.11 4.11 0 0 1 3.52-1.93c2.25 0 3.45 1.48 3.45 3.99z" />
  </svg>
);

export const ZodIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M4 4h16v3.2L9.2 16.8H20V20H4v-3.2L14.8 7.2H4V4z" />
  </svg>
);

export const LucideIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

export const ZustandIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M18.8 8.4c-.6-.8-1.5-1.4-2.5-1.7-.5-1.5-1.6-2.7-3.1-3.3-2.1-.8-4.5-.4-6.1 1.1-.9.8-1.5 1.9-1.8 3.1-1.4.5-2.5 1.5-3 2.9-.6 1.4-.4 3 .4 4.3.8 1.2 2.1 1.9 3.6 2 .5 1.6 1.6 2.9 3.2 3.6 2 .8 4.3.4 5.9-1 1-1 1.7-2.2 2-3.6 1.5-.4 2.7-1.5 3.2-3 .5-1.5.3-3.1-.6-4.4zm-11.4 6c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9zm6.6 0c-.5 0-.9-.4-.9-.9s.4-.9.9-.9.9.4.9.9-.4.9-.9.9z" />
  </svg>
);

export const StackOverflowIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.986 21.865v-6.408h2.134V24H1.87v-8.543h2.134v6.408h14.982zM6.111 19.731h10.685v-2.137H6.111v2.137zm.9-4.857 10.23 3.12.63-2.04-10.23-3.12-.63 2.04zm2.146-4.996 9.07 5.67 1.13-1.81-9.07-5.67-1.13 1.81zm4.183-4.957 7.07 8.04 1.6-1.41-7.07-8.04-1.6 1.41zm6.05-4.921-1.92 1.05 4.96 9.47 1.92-1.05-4.96-9.47z" />
  </svg>
);

export const GitHubIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

export const PrismaIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="m3.79 17.84 8.7-16.14a.8.8 0 0 1 1.4.03l6.32 12.63-7.22 7.85a.8.8 0 0 1-1.2-.04l-8-4.33zm9.03-12.7L6.2 16.92l5.77 3.12 5.25-5.7-4.4-9.2z" />
  </svg>
);

export const DockerIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13.983 11.078h2.119a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.119a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 0 0 .186-.186V3.574a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 0 0 .186-.186V6.29a.186.186 0 0 0-.186-.185h-2.118a.185.185 0 0 0-.185.185v1.887c0 .102.082.186.185.186m-2.93 0h2.12a.186.186 0 0 0 .184-.186V6.29a.185.185 0 0 0-.185-.185H8.1a.185.185 0 0 0-.185.185v1.887c0 .102.083.186.185.186m-2.964 0h2.119a.186.186 0 0 0 .185-.186V6.29a.185.185 0 0 0-.185-.185H5.136a.186.186 0 0 0-.186.185v1.887c0 .102.084.186.186.186m5.893 2.714h2.118a.186.186 0 0 0 .186-.185V9.006a.186.186 0 0 0-.186-.186h-2.118a.185.185 0 0 0-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 0 0 .184-.185V9.006a.185.185 0 0 0-.184-.186H8.1a.185.185 0 0 0-.185.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 0 0 .185-.185V9.006a.185.185 0 0 0-.185-.186H5.136a.186.186 0 0 0-.186.185v1.888c0 .102.084.185.186.185m-2.928 0h2.12a.185.185 0 0 0 .185-.185V9.006a.186.186 0 0 0-.186-.186h-2.12a.185.185 0 0 0-.184.185v1.888c0 .102.083.185.185.185M23.77 12.02c-.407-.29-1.284-.44-2.26-.14-.236.07-.468.17-.687.29-.395-.88-1.12-1.42-2.1-1.63-.33-.07-.66-.09-.98-.06l-.54.04-.32.44c-.6.8-1.07 1.76-1.39 2.82H1.14c-.16 0-.29.13-.29.29 0 2.91 1.09 5.37 3.23 7.32 1.94 1.77 4.38 2.62 7.24 2.62 6.55 0 11.45-4.22 12.39-10.66.04-.26-.06-.5-.24-.65" />
  </svg>
);

export const CiCdIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" />
    <line x1="6" y1="9" x2="6" y2="21" />
  </svg>
);

export const CloudflareIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.3 10.7c-.4-2.8-2.8-4.9-5.7-4.9-2.3 0-4.3 1.4-5.2 3.4C4.3 9.7 2 12.1 2 15c0 3.3 2.7 6 6 6h10.5c2.5 0 4.5-2 4.5-4.5 0-2.3-1.7-4.2-4-4.5-.2-.1-.4-.2-.7-.3z" />
  </svg>
);

export const RedisIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M1.3 6.9 12 1.5l10.7 5.4-4.8 2.4-5.9-3-5.9 3-4.8-2.4zm10.7 4.1 6.5-3.3 4.2 2.1-10.7 5.4-10.7-5.4 4.2-2.1 6.5 3.3zm0 6.6 6.5-3.3 4.2 2.1-10.7 5.4L1.3 16.4l4.2-2.1 6.5 3.3z" />
  </svg>
);

export const TanStackStartIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
    <path d="M12 22V12" />
  </svg>
);

export const PostgreSqlIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.4z" />
  </svg>
);

export const ClerkIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm3.5-9.5a2.5 2.5 0 1 1-2.5-2.5 2.5 2.5 0 0 1 2.5 2.5zm-3.5 4.5c2.33 0 4.31 1.46 5.12 3.5H6.88c.81-2.04 2.79-3.5 5.12-3.5z" />
  </svg>
);

export const ZendeskIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2.5a9.5 9.5 0 0 0-9.5 9.5H12V2.5zm0 19a9.5 9.5 0 0 0 9.5-9.5H12v9.5zm-9.5-7a9.5 9.5 0 0 0 7 7V14.5H2.5zm19-5a9.5 9.5 0 0 0-7-7v7h7z" />
  </svg>
);

export const MongoDbIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 1.5c-.3 0-.6.1-.8.4C9.5 4.1 6.5 8.7 6.5 13.2c0 3.7 2.4 6.8 5.1 8.8.2.2.4.3.4.5s-.2-.3-.4-.5c-2.7-2-5.1-5.1-5.1-8.8 0-4.5 3-9.1 4.7-11.3.2-.3.5-.4.8-.4s.6.1.8.4c1.7 2.2 4.7 6.8 4.7 11.3 0 3.7-2.4 6.8-5.1 8.8-.2.2-.4.3-.4.5s.2-.3.4-.5c2.7-2 5.1-5.1 5.1-8.8 0-4.5-3-9.1-4.7-11.3-.2-.3-.5-.4-.8-.4zM11.6 8v13.5c-.7-.5-1.5-1.2-2.1-2-1.9-2.3-2-5.1-2-6.3 0-3.3 1.9-6.9 4.1-9.2V8z" />
  </svg>
);

export const MySqlIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 3C7.03 3 3 4.79 3 7v10c0 2.21 4.03 4 9 4s9-1.79 9-4V7c0-2.21-4.03-4-9-4zm0 2c4.42 0 7 1.48 7 2s-2.58 2-7 2-7-1.48-7-2 2.58-2 7-2zm-7 4.97c1.55.8 4.14 1.03 7 1.03s5.45-.23 7-1.03V12c0 .52-2.58 2-7 2s-7-1.48-7-2V9.97zm0 5c1.55.8 4.14 1.03 7 1.03s5.45-.23 7-1.03V17c0 .52-2.58 2-7 2s-7-1.48-7-2v-2.03z" />
  </svg>
);

export const HonoIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2C9.5 6 7 8.5 7 12c0 3.3 2.2 6 5 6s5-2.7 5-6c0-3.5-2.5-6-5-10zm0 18c-4.4 0-8-3.6-8-8 0-4 3-7.5 5-9.5-.3 1.8.2 3.8 1.5 5.2 1.3 1.4 1.8 3.3 1.5 5.3 1.2-1 2-2.5 2-4.2 0-.6-.1-1.2-.3-1.8 1.4 1.3 2.3 3.1 2.3 5 0 4.4-3.6 8-8 8z" />
  </svg>
);

export const ExpressIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export const WorkOsIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M2.5 5.5h4.2l3.3 9.4 3-8.4h3l3 8.4 3.3-9.4H23.5L18.8 19h-3.6L12 9.6 8.8 19H5.2L2.5 5.5z" />
  </svg>
);

export const RestApiIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const TrpcIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M12 3l9 16H3l9-16z" />
    <circle cx="12" cy="14" r="2" fill="currentColor" />
  </svg>
);

export const GrpcIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

export const GraphQlIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2a2 2 0 0 0-1.73 1L3.27 15a2 2 0 0 0 0 2l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 0-2L13.73 3A2 2 0 0 0 12 2zm0 2.31L18.42 15H5.58L12 4.31zM4.73 16.5l1.62-.93 5.65 3.26v1.88L4.73 16.5zm14.54 0L12 20.71v-1.88l5.65-3.26 1.62.93z" />
  </svg>
);

export const YouTubeIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const AuroraScharffIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="4" />
    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
  </svg>
);

export const LydiaHallieIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </svg>
);

/**
 * MasterDevIcon — master.dev's actual calligraphic M lettermark.
 * Stylised script M using currentColor so it adapts to light/dark theme.
 */
export const MasterDevIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {/* Left outer stroke with top serif flourish */}
    <path
      d="M3 19
         C3 19 2.5 18 2.8 15
         C3.1 12 4 9 4.5 7
         C4.8 5.8 5.2 4.5 5.8 4
         C6.2 3.6 6.8 3.5 7.2 3.8
         C7.6 4.1 7.5 4.8 7.2 5.5"
      strokeWidth="1.4"
    />
    {/* Left diagonal down to the center valley */}
    <path
      d="M7.2 5.5
         C8 7 9 9.5 9.5 12
         C10 14 10.2 15.5 10.2 17"
      strokeWidth="1.3"
    />
    {/* Right diagonal up from center valley */}
    <path
      d="M10.2 17
         C10.6 14.5 11.5 11.5 12.5 9
         C13.2 7 14 5.5 14.8 5.2"
      strokeWidth="1.3"
    />
    {/* Right outer stroke with top serif flourish */}
    <path
      d="M14.8 5.2
         C15.3 5 15.8 4.8 16.3 4.5
         C16.8 4.2 17.1 4 17.5 4.2
         C18 4.5 18.2 5.2 18.4 6.5
         C18.8 9 19.2 12 19.5 15
         C19.7 17 20 18.5 20 19"
      strokeWidth="1.4"
    />
    {/* Top connecting flourish across the two peaks */}
    <path
      d="M5.5 4.5 C7 3.2 9.5 3 12 3.5 C14.5 4 16.5 3.8 17.8 4.5"
      strokeWidth="0.9"
      opacity="0.6"
    />
  </svg>
);

export const NodeJsIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2a1.8 1.8 0 0 0-.9.24l-7.8 4.5A1.8 1.8 0 0 0 2.4 8.3v9a1.8 1.8 0 0 0 .9 1.56l7.8 4.5a1.8 1.8 0 0 0 1.8 0l7.8-4.5a1.8 1.8 0 0 0 .9-1.56v-9a1.8 1.8 0 0 0-.9-1.56l-7.8-4.5A1.8 1.8 0 0 0 12 2zm0 2.3 6.9 4-6.9 4-6.9-4 6.9-4zm-7.8 6.1 6.9 4v7.9l-6.9-4v-7.9zm15.6 0v7.9l-6.9 4v-7.9l6.9-4z" />
  </svg>
);

export const WebSocketIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M7 8l-4 4 4 4" />
    <path d="M17 8l4 4-4 4" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);

export const OpenAiIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 8.713a4.485 4.485 0 0 1 2.365-1.973V12.28a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 8.713zm15.778 3.864L12.275 9.21l2.02-1.168a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.558a.785.785 0 0 0-.402-.682zm2.28-4.413-.142-.085-4.782-2.759a.775.775 0 0 0-.78 0L8.85 8.689V6.357a.08.08 0 0 1 .033-.062L13.723 3.5a4.5 4.5 0 0 1 6.677 4.664zM8.304 10.79l2.455-1.417 2.455 1.417v2.834L10.76 15.04l-2.455-1.417V10.79z" />
  </svg>
);

export const AnthropicIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M13.827 3.5h3.945l6.228 17h-4.004l-1.39-3.882H11.45l-1.39 3.882H6.056L13.827 3.5zm3.504 9.99-2.15-6.007-2.15 6.007h4.3zm-13.33-9.99h3.944L0 20.5h3.945l4.001-17z" />
  </svg>
);

export const LangChainIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <circle cx="18" cy="18" r="3" />
    <path d="M9 6h6" />
    <path d="M6 9v6" />
    <path d="M18 9v6" />
    <path d="M9 18h6" />
    <path d="M8.5 8.5l7 7" />
  </svg>
);

export const HuggingFaceIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3.5 7a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-3.5 9c-2.33 0-4.31-1.46-5.12-3.5h10.24c-.81 2.04-2.79 3.5-5.12 3.5z" />
  </svg>
);

export const OllamaIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9 10h.01" />
    <path d="M15 10h.01" />
    <path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
  </svg>
);

export const VectorDbIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

export const LlamaIndexIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

export const KarpathyIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
  </svg>
);

export const NeuralNetworkIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <circle cx="5" cy="6" r="2" fill="currentColor" />
    <circle cx="5" cy="18" r="2" fill="currentColor" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <circle cx="19" cy="6" r="2" fill="currentColor" />
    <circle cx="19" cy="18" r="2" fill="currentColor" />
    <line x1="7" y1="6" x2="10" y2="12" />
    <line x1="7" y1="18" x2="10" y2="12" />
    <line x1="14" y1="12" x2="17" y2="6" />
    <line x1="14" y1="12" x2="17" y2="18" />
  </svg>
);

export const AxiosIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M11.05 3.12 3.65 17.5a1.2 1.2 0 0 0 1.07 1.75h3.45l2.2-4.4h3.26l2.2 4.4h3.45a1.2 1.2 0 0 0 1.07-1.75L12.95 3.12a1.08 1.08 0 0 0-1.9 0zm.95 4.68 2.45 4.9h-4.9z" />
  </svg>
);

export const GitIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M23.546 10.93 13.067.452a2.02 2.02 0 0 0-2.857 0L8.27 2.392l3.606 3.606a2.399 2.399 0 0 1 3.03 3.06l3.47 3.47a2.394 2.394 0 0 1 2.228 3.328 2.41 2.41 0 0 1-3.268.87l-3.328-3.328a2.408 2.408 0 0 1-2.91-2.91L7.54 6.841 1.066 13.315a2.02 2.02 0 0 0 0 2.857l10.48 10.477a2.02 2.02 0 0 0 2.856 0l9.144-9.143a2.02 2.02 0 0 0 0-2.857" />
  </svg>
);



export const XenditIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" aria-hidden="true" {...props}>
    <path d="M18.8 3.5h-3.6L12 8.7 8.8 3.5H5.2l4.8 7.7-5 8.3h3.6l3.4-5.6 3.4 5.6h3.6l-5.2-8.3 5-7.7z" />
  </svg>
);

/**
 * Linq Icon — isometric cube brand mark.
 * Uses currentColor strokes with opacity-based face shading for light/dark theme support.
 */
export const LinqIcon: FC<IconProps> = ({ width = 20, height = 20, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    width={width}
    height={height}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {/* Top face — lightest fill for highlight */}
    <polygon points="12,2 22,7 12,12 2,7" fill="currentColor" fillOpacity="0.15" />
    {/* Left face — mid fill */}
    <polygon points="2,7 12,12 12,22 2,17" fill="currentColor" fillOpacity="0.06" />
    {/* Right face — darkest fill for shadow side */}
    <polygon points="22,7 12,12 12,22 22,17" fill="currentColor" fillOpacity="0.1" />
    {/* Outline edges for crisp definition */}
    <polyline points="2,7 12,2 22,7 12,12 2,7" strokeWidth="1.3" />
    <line x1="12" y1="12" x2="12" y2="22" />
    <line x1="2" y1="7" x2="2" y2="17" />
    <line x1="22" y1="7" x2="22" y2="17" />
    <line x1="2" y1="17" x2="12" y2="22" />
    <line x1="22" y1="17" x2="12" y2="22" />
  </svg>
);

