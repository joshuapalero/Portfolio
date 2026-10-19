import type { FC, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

export const ReactIcon: FC<IconProps> = (props) => (
  <svg viewBox="-11.5 -10.23174 23 20.46348" width="16" height="16" fill="currentColor" {...props}>
    <circle cx="0" cy="0" r="2.05" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2" />
      <ellipse rx="11" ry="4.2" transform="rotate(60)" />
      <ellipse rx="11" ry="4.2" transform="rotate(120)" />
    </g>
  </svg>
);

export const TypeScriptIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="4" stroke="currentColor" strokeWidth="1.5" fill="none" />
    <path
      d="M11.5 13.5H9.2v5.5H7V13.5H4.8V11.8h6.7v1.7zm7.5 2c-.2-.9-.8-1.5-1.9-1.9l-.7-.3c-.5-.2-.8-.4-.8-.7 0-.3.2-.5.6-.5.5 0 .8.2 1.1.5l1.6-1.1c-.6-.9-1.5-1.3-2.7-1.3-1.8 0-3 1-3 2.5 0 1.1.6 1.8 1.9 2.4l.8.3c.7.3 1 .5 1 .9 0 .4-.3.6-.8.6-.7 0-1.1-.3-1.3-.8l-1.7 1c.5 1.1 1.5 1.6 3 1.6 2 0 3.2-1.1 3.2-2.6 0-.7-.2-1.3-.6-1.6z"
      fill="currentColor"
    />
  </svg>
);

export const JavaScriptIcon: FC<IconProps> = (props) => (
  <svg viewBox="4 6 20 15" width="16" height="16" fill="currentColor" {...props}>
    <path
      d="M6.5 18.5c.8.8 1.8 1.3 2.9 1.3 1.6 0 2.6-.8 2.6-2.3v-7.1H9.8v7.1c0 .5-.3.8-.8.8-.5 0-.9-.3-1.2-.6l-1.3 1.7zm8.3.1c1.2.7 2.6 1.2 3.9 1.2 2.3 0 3.7-1.1 3.7-2.9 0-1.5-.9-2.3-2.6-3l-.9-.4c-.9-.4-1.3-.8-1.3-1.4 0-.6.5-1.1 1.3-1.1.8 0 1.5.3 2.1.7l.9-1.6c-.8-.6-1.9-.9-3-.9-2.1 0-3.5 1.2-3.5 2.8 0 1.4.9 2.3 2.5 2.9l.9.4c1 .4 1.5.8 1.5 1.5 0 .7-.6 1.2-1.5 1.2-1 0-1.9-.4-2.5-1l-1 1.5z"
      fill="currentColor"
    />
  </svg>
);

export const NextJsIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M5 3.5h3.2v17H5z" />
    <path d="M15.8 3.5H19v17h-3.2z" />
    <polygon points="5 3.5 9 3.5 19 18.5 15.5 18.5" />
  </svg>
);

export const HtmlIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M3 2l1.8 19.5L12 24l7.2-2.5L21 2H3zm14.8 5.5h-8.2l.2 2.3h7.8l-.6 6.9-4.2 1.2-4.2-1.2-.3-3.3h2.3l.1 1.7 2.1.6 2.1-.6.3-3.2H6.9l-.6-6.7h11.8l-.3 2.3z" />
  </svg>
);

export const CssIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M3 2l1.8 19.5L12 24l7.2-2.5L21 2H3zm14.7 5.5l-.2 2.3H8.3l.2 2.3h8.8l-.6 6.9-4.7 1.3-4.7-1.3-.3-3.5h2.3l.2 1.8 2.5.7 2.5-.7.3-3.2H6.7l-.6-6.7h11.6z" />
  </svg>
);

export const ViteIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M22.5 4.3 12.8 22.8a.9.9 0 0 1-1.6 0L1.5 4.3a.9.9 0 0 1 .8-1.3h19.4a.9.9 0 0 1 .8 1.3Z" opacity="0.35" />
    <path d="m14 2.5-6.5 12h4.5l-2.5 7 8.5-12h-4.5l3.5-7h-3z" />
  </svg>
);

export const BunIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3c-4.8 0-9 3-10 7.5-.8 3.5.5 7 3 9 2.5 2 6 2 9 1 4-1 7-4 7.5-8.5.5-4-1.5-7.5-4.5-9-1.5-.7-3.3-1-5-1Z" />
    <circle cx="9.5" cy="13" r="1" fill="currentColor" stroke="none" />
    <circle cx="14.5" cy="13" r="1" fill="currentColor" stroke="none" />
  </svg>
);

export const NodeIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M12 2 3.5 6.9v9.8L12 21.6l8.5-4.9V6.9L12 2zm5.7 12.8-5.7 3.3-5.7-3.3V8.1L12 4.8l5.7 3.3v6.7z" />
  </svg>
);

export const TailwindIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M12 6c-3.3 0-5.3 1.7-6 5 1.2-1.7 2.7-2.3 4.5-1.8.8.2 1.4.8 2 1.5C13.6 11.8 15 13.3 18 13.3c3.3 0 5.3-1.7 6-5-1.2 1.7-2.7 2.3-4.5 1.8-.8-.2-1.4-.8-2-1.5C16.4 7.5 15 6 12 6zm-6 7.3c-3.3 0-5.3 1.7-6 5 1.2-1.7 2.7-2.3 4.5-1.8.8.2 1.4.8 2 1.5C7.6 19.1 9 20.7 12 20.7c3.3 0 5.3-1.7 6-5-1.2 1.7-2.7 2.3-4.5 1.8-.8-.2-1.4-.8-2-1.5-1.1-1.2-2.5-2.7-5.5-2.7z" />
  </svg>
);

export const DockerIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M21.9 11.2c-.3-.2-1.1-.3-2.1.2-.4-.6-1.1-1-1.9-1-.3 0-.6.1-.9.2-.6-1.3-1.9-2.1-3.4-2.1H12v2.4h3.6c.7 0 1.2.6 1.2 1.3v.4c0 .3.2.5.5.5.6 0 1.2.4 1.3 1 .1.4-.1.8-.4 1.1-.2.2-.3.5-.2.8.2.8.1 1.7-.4 2.4-1.2 1.8-3.4 3-5.6 3-4.2 0-7.7-3.1-8.3-7.2h15.2c.4 0 .8-.2 1-.5.2-.4.2-.8.1-1.2-.2-.6-.3-1.2-.3-1.7zM2.8 10.5h2.4v2.4H2.8zm3.2 0h2.4v2.4H6zm3.2 0h2.4v2.4H9.2zm0-3.2h2.4v2.4H9.2zm3.2 0h2.4v2.4h-2.4zm0-3.2h2.4v2.4h-2.4z" />
  </svg>
);

export const GitIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="m21.7 10.7-8.4-8.4a2.5 2.5 0 0 0-3.5 0L7.5 4.6l3.3 3.3a2.3 2.3 0 0 1 2.9 2.9l3.2 3.2a2.3 2.3 0 1 1-1.2 1.2l-2.9-2.9v4.8a2.3 2.3 0 1 1-1.7 0V9.8a2.3 2.3 0 0 1-1.2-2.9L6.6 3.7 2.3 8a2.5 2.5 0 0 0 0 3.5l8.4 8.4a2.5 2.5 0 0 0 3.5 0l7.5-7.5a2.5 2.5 0 0 0 0-3.5z" />
  </svg>
);

export const TanStackStartIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" {...props}>
    <path d="M4 17c2.5-3.5 5.5-5 8-5s5.5 1.5 8 5" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M6 13c2-2.5 4-3.5 6-3.5s4 1 6 3.5" strokeWidth="1.8" strokeLinecap="round" />
    <polygon points="12 3 13.5 7 18 7 14.5 9.5 16 13.5 12 11 8 13.5 9.5 9.5 6 7 10.5 7" fill="currentColor" stroke="none" />
  </svg>
);

export const ExpressIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <text x="12" y="17" fontSize="16" fontWeight="900" textAnchor="middle" fill="currentColor" fontFamily="'Space Mono', monospace">
      ex
    </text>
  </svg>
);

export const HonoIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M12 2C10.5 5 8 7.5 8 11c0 1.2.4 2.3 1 3.2-.2-.7-.3-1.4-.3-2.2 0-2.2 1.3-4.1 2.3-5 1 2 2.5 3.3 2.5 6 0 .8-.2 1.6-.6 2.3 1.8-.7 3.1-2.4 3.1-4.3 0-3-2-6-4-9Z" opacity="0.6" />
    <path d="M12 7c-2 2.5-4 5-4 8.5 0 2.8 2 4.5 4 4.5s4-1.7 4-4.5c0-3.5-2-6-4-8.5Z" />
  </svg>
);

export const GitHubIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const CiCdIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M6 9v6" />
    <path d="M18 12a6 6 0 0 0-6-6H9" />
    <polyline points="15 3 18 6 15 9" />
    <path d="M9 18h3a6 6 0 0 0 6-6" />
  </svg>
);

export const CloudflareIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
  </svg>
);

export const LucideIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m2 18 3-3h5l4 4-2 3H5l-3-4Z" />
    <path d="M10 15V8l5-5 4 4-7 8" />
    <path d="m14 7 3 3" />
  </svg>
);

export const WebSocketIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 8h14M15 4l4 4-4 4" />
    <path d="M19 16H5M9 20l-4-4 4-4" />
    <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
  </svg>
);

export const ZedIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M4 4.5h16l-2.2 4H9.5l9 7.5H20V20H4l2.2-4h8.3L5.5 8.5H4V4.5z" />
  </svg>
);

export const EsLintIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M12 2l8.7 5v10L12 22l-8.7-5V7L12 2zm0 2.3L5.3 8.2v7.6L12 19.7l6.7-3.9V8.2L12 4.3zm-.9 3.7h1.8v6.2h-1.8V8zm0 7.8h1.8v1.8h-1.8v-1.8z" />
  </svg>
);

export const PrettierIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M6 3a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3H6zm0 7a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3H6zm7-7a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-4zm0 7a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3h-2z" />
  </svg>
);

export const OpenAiIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M22.28 10.37a5.52 5.52 0 0 0-.47-4.48 5.68 5.68 0 0 0-3.66-2.65 5.59 5.59 0 0 0-5.06 1.14 5.58 5.58 0 0 0-4.22-.1 5.67 5.67 0 0 0-3.19 3.2 5.59 5.59 0 0 0-1.74 4.89 5.66 5.66 0 0 0 .47 4.48 5.67 5.67 0 0 0 3.66 2.65 5.59 5.59 0 0 0 5.06-1.14 5.58 5.58 0 0 0 4.22.1 5.67 5.67 0 0 0 3.19-3.2 5.58 5.58 0 0 0 1.74-4.89zM13.1 20.35a4.24 4.24 0 0 1-2.62-.91l.13-.07 4.38-2.53a.7.7 0 0 0 .35-.61V10.1l1.83 1.06a.07.07 0 0 1 .04.06v5.06a4.24 4.24 0 0 1-4.11 4.07zm-7.6-3.32a4.23 4.23 0 0 1-.5-2.73l.13.08 4.38 2.53a.7.7 0 0 0 .7 0l5.32-3.07v2.11a.07.07 0 0 1-.03.06l-4.38 2.53a4.24 4.24 0 0 1-5.62-1.51zm-1.1-7.85a4.23 4.23 0 0 1 2.12-1.82v5.21a.7.7 0 0 0 .35.61l5.32 3.07-1.83 1.06a.07.07 0 0 1-.07 0l-4.38-2.53a4.24 4.24 0 0 1-1.51-5.6zm13.13 2.11-5.32-3.07 1.83-1.06a.07.07 0 0 1 .07 0l4.38 2.53a4.24 4.24 0 0 1 1.51 5.6 4.23 4.23 0 0 1-2.12 1.82v-5.21a.7.7 0 0 0-.35-.61zm2.06-2.5a4.23 4.23 0 0 1 .5 2.73l-.13-.08-4.38-2.53a.7.7 0 0 0-.7 0l-5.32 3.07V9.71a.07.07 0 0 1 .03-.06l4.38-2.53a4.24 4.24 0 0 1 5.62 1.51zM8.83 13.9l-1.83-1.06a.07.07 0 0 1-.04-.06V7.72a4.24 4.24 0 0 1 6.73-3.16l-.13.07-4.38 2.53a.7.7 0 0 0-.35.61v6.13zm1.06-2.88 2.11-1.22 2.11 1.22v2.44l-2.11 1.22-2.11-1.22v-2.44z" />
  </svg>
);

export const GrokIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M3.5 3h4.2l4.8 6.4L17.5 3h3l-6.5 8.7L21 21h-4.2l-5.2-7-5.5 7h-3l7-9.4L3.5 3zm5.6 2.4L5.8 5.4l10 13.2h2.4L9.1 5.4z" />
  </svg>
);

export const ClaudeIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M13.5 2.5h-3v5l-3.5-3.5-2.1 2.1 3.5 3.5h-5v3h5l-3.5 3.5 2.1 2.1 3.5-3.5v5h3v-5l3.5 3.5 2.1-2.1-3.5-3.5h5v-3h-5l3.5-3.5-2.1-2.1-3.5 3.5v-5z" />
  </svg>
);

export const PostgreSqlIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M12 2C7.5 2 4.5 4.5 4.5 7.5c0 1.8.8 3.5 2 4.5v6c0 .8.7 1.5 1.5 1.5H9v-3h1.5v3H12v-5c2.5-.5 4.5-2.5 4.5-5.5 0-1-.3-1.8-.8-2.5 1.8-.2 3.8-.8 3.8-2 0-.8-.8-1.5-2.2-1.5-1.5 0-3.3.5-4.8 1.2C13.8 2.3 12.9 2 12 2z" />
  </svg>
);

export const MySqlIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M19.5 7.5c-1.5-1-3.5-.8-5 .2-1.2.8-2 2-2.5 3.3-.3.8-.5 1.8-.5 2.7 0 2.2 1 4.3 2.7 5.7.5.4 1 .7 1.6.9-.8-.5-1.5-1.2-2-2-.8-1.3-1-2.9-.6-4.4.4-1.5 1.4-2.8 2.7-3.6 1.4-.8 3-.9 4.5-.4.5.2 1 .5 1.4.9-.3-1.4-1.2-2.6-2.3-3.3zM4 14c0 3 3.6 5 8 5-1.5-.7-2.7-1.8-3.5-3.2-.8-1.4-.9-3-.4-4.5.5-1.5 1.6-2.7 3-3.4 1.4-.7 3-.8 4.5-.3-1-1.3-2.6-2.1-4.2-2.1C6.8 5.5 4 9.3 4 14z" />
  </svg>
);

export const PrismaIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M12.7 2.3a1 1 0 0 0-1.4 0L2.5 11.1a1 1 0 0 0-.2.9l4.8 9.6a1 1 0 0 0 1 .5h11.8a1 1 0 0 0 .9-.6 1 1 0 0 0 0-1L12.7 2.3zm-.7 3L18.2 18H8.5l-4-8 7.5-4.7z" />
  </svg>
);

export const ClerkIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 6a6 6 0 1 0 0 12" />
    <circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

export const WorkOsIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M3 5h3.2l3.8 11.2L13.8 6h3.4l3.8 10.2L24.8 5H28l-5 14h-3.6l-3.9-10.2L11.6 19H8L3 5z" transform="scale(0.75) translate(3, 3)" />
  </svg>
);

export const XenditIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M11.781 2.743H7.965l-5.341 9.264 5.341 9.263-1.312 2.266L0 12.007 6.653.464h6.454l-1.326 2.279Zm-5.128 2.28 1.312-2.28L9.873 6.03 8.561 8.296 6.653 5.023Zm9.382-2.28 1.312 2.28L7.965 21.27l-1.312-2.279 9.382-16.248Zm-5.128 20.793 1.298-2.279h3.83L14.1 17.931l1.312-2.267 1.926 3.337 4.038-6.994-5.341-9.264L17.347.464 24 12.007l-6.653 11.529h-6.44Z" />
  </svg>
);

export const GraphQlIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polygon points="12 2 21 7.2 21 16.8 12 22 3 16.8 3 7.2" />
    <polygon points="12 6.5 17 9.4 17 14.6 12 17.5 7 14.6 7 9.4" />
    <circle cx="12" cy="2" r="1.2" fill="currentColor" />
    <circle cx="21" cy="7.2" r="1.2" fill="currentColor" />
    <circle cx="21" cy="16.8" r="1.2" fill="currentColor" />
    <circle cx="12" cy="22" r="1.2" fill="currentColor" />
    <circle cx="3" cy="16.8" r="1.2" fill="currentColor" />
    <circle cx="3" cy="7.2" r="1.2" fill="currentColor" />
  </svg>
);

export const TrpcIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 128 128" width="16" height="16" fill="currentColor" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M63.9 18.8 81.6 29v5.6l21.5 12.5v21.2l5.8 3.3v20.6l-17.7 10.2-7.9-4.6-19.2 11.1-19.1-11-7.7 4.5-17.8-10.3V71.6l5.6-3.2V47.1l21-12.2V29zM81.7 40v9.6L63.9 59.8 46.2 49.6v-9.3l-16.5 9.5v16l7.6-4.4 17.8 10.3v20.5l-5.4 3.1 14.5 8.3 14.5-8.4-5.3-3V71.7l17.8-10.3 7.4 4.3V49.8zm7.2 55.8V83.2L78.1 77v12.5zM104.3 77l-10.8 6.3v12.5l10.8-6.3zM35 95.8V83.3L24.1 77v12.5zm15.5-18.7-10.8 6.2v12.5l10.8-6.2zm40.7 2.3 10.9-6.3-10.9-6.2-10.8 6.2zM37.3 66.9l-10.8 6.2 10.8 6.3 10.8-6.3zm24.3-13.6V40.8l-10.8-6.2v12.5zm15.5-18.8-10.9 6.3v12.5L77.1 47zm-13.2 2.3 10.9-6.3-10.9-6.2-10.8 6.2z"
    />
  </svg>
);

export const GrpcIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="5" cy="12" r="2.5" fill="currentColor" />
    <circle cx="19" cy="6" r="2.5" fill="currentColor" />
    <circle cx="19" cy="18" r="2.5" fill="currentColor" />
    <path d="M7.5 12h5m0 0 4-4.5M12.5 12l4 4.5" />
    <path d="M12.5 9v6" />
  </svg>
);

export const RestIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 9h16M16 5l4 4-4 4M20 15H4M8 19l-4-4 4-4" />
  </svg>
);

export const OfficialDocsIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

export const DocsIcon = OfficialDocsIcon;

export const StackOverflowIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" {...props}>
    <path d="M15.725 0l-1.72 1.277 6.39 8.588 1.716-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.092-10.473-2.203zM1.89 15.47V24h19.19v-8.53h-2.133v6.397H4.021v-6.396H1.89zm4.265 2.133v2.13h10.66v-2.13H6.154Z" />
  </svg>
);

export const InternetIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

export const GlobeIcon = InternetIcon;

