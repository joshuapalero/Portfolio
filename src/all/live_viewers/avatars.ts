/**
 * Bleach Anime Characters Avatar System (2 Girls, 3 Boys)
 * 100% Monochrome / Black & White Manga Style SVGs.
 *
 * 1. Rukia Kuchiki (Girl 1) - Squad 13 / Sode no Shirayuki
 * 2. Orihime Inoue (Girl 2) - Shun Shun Rikka
 * 3. Ichigo Kurosaki (Boy 1) - Substitute Shinigami / Zangetsu
 * 4. Kisuke Urahara (Boy 2) - Former Squad 12 Captain / Striped Hat
 * 5. Toshiro Hitsugaya (Boy 3) - Squad 10 Captain / Hyorinmaru
 *
 * Handcrafted pure SVGs: zero network latency, crisp vector scaling, 100% offline.
 */

export interface BleachAvatarMeta {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly gender: 'girl' | 'boy';
}

export const BLEACH_AVATARS_META: readonly BleachAvatarMeta[] = [
  { id: 'rukia', name: 'Rukia Kuchiki', title: 'Soul Reaper (Squad 13)', gender: 'girl' },
  { id: 'orihime', name: 'Orihime Inoue', title: 'Shun Shun Rikka Wielder', gender: 'girl' },
  { id: 'ichigo', name: 'Ichigo Kurosaki', title: 'Substitute Shinigami', gender: 'boy' },
  { id: 'urahara', name: 'Kisuke Urahara', title: 'Shopkeeper & Former Captain', gender: 'boy' },
  { id: 'toshiro', name: 'Toshiro Hitsugaya', title: 'Squad 10 Captain', gender: 'boy' },
] as const;

export const SKETCH_AVATARS: readonly string[] = [
  // 1. Rukia Kuchiki (Girl 1) - Bob cut with iconic center strand, Soul Reaper Shihakusho
  `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#121212" stroke="#ffffff" stroke-width="2"/>
    <circle cx="50" cy="50" r="44" fill="#1e1e1e"/>
    <path d="M26 46 C24 64 30 76 34 82 C38 78 40 70 40 66 L60 66 C60 70 62 78 66 82 C70 76 76 64 74 46 Z" fill="#000000"/>
    <path d="M20 96 C20 78 34 72 45 70 L55 70 C66 72 80 78 80 96 Z" fill="#000000" stroke="#ffffff" stroke-width="1.5"/>
    <path d="M43 70 L50 82 L57 70" fill="#ffffff"/>
    <path d="M46 70 L50 78 L54 70" fill="#000000"/>
    <line x1="50" y1="82" x2="50" y2="96" stroke="#ffffff" stroke-width="1.5"/>
    <path d="M45 60 L45 72 L55 72 L55 60 Z" fill="#ffffff"/>
    <path d="M33 44 C33 60 40 68 50 68 C60 68 67 60 67 44 C67 32 60 26 50 26 C40 26 33 32 33 44 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
    <path d="M30 42 C28 26 40 20 50 20 C60 20 72 26 70 42 C67 36 60 30 50 30 C40 30 33 36 30 42 Z" fill="#000000"/>
    <path d="M30 40 C32 50 34 60 38 64 C36 58 35 48 35 40 Z" fill="#000000"/>
    <path d="M70 40 C68 50 66 60 62 64 C64 58 65 48 65 40 Z" fill="#000000"/>
    <path d="M48 28 C49 38 49 48 51 54 C50 48 50 38 52 28 Z" fill="#000000"/>
    <path d="M38 43 Q43 41 46 43" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M62 43 Q57 41 54 43" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M38 46 Q42 43 46 47" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="42" cy="50" rx="3.5" ry="4.5" fill="#000000"/>
    <circle cx="41" cy="48.5" r="1.5" fill="#ffffff"/>
    <circle cx="43.5" cy="52" r="0.8" fill="#ffffff"/>
    <path d="M39 54 Q42 56 45 54" stroke="#000000" stroke-width="1"/>
    <path d="M54 47 Q58 43 62 46" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="58" cy="50" rx="3.5" ry="4.5" fill="#000000"/>
    <circle cx="57" cy="48.5" r="1.5" fill="#ffffff"/>
    <circle cx="59.5" cy="52" r="0.8" fill="#ffffff"/>
    <path d="M55 54 Q58 56 61 54" stroke="#000000" stroke-width="1"/>
    <circle cx="50" cy="58" r="0.8" fill="#000000"/>
    <path d="M47 62 Q50 63.5 53 62" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  // 2. Orihime Inoue (Girl 2) - Long flowing hair, Shun Shun Rikka hairpins, kind smile
  `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#121212" stroke="#ffffff" stroke-width="2"/>
    <circle cx="50" cy="50" r="44" fill="#1e1e1e"/>
    <path d="M24 45 C20 65 20 85 24 96 L76 96 C80 85 80 65 76 45 Z" fill="#000000"/>
    <path d="M22 96 C22 80 34 74 45 72 L55 72 C66 74 78 80 78 96 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
    <path d="M38 72 L50 86 L62 72 Z" fill="#000000"/>
    <path d="M44 80 L50 94 L56 80 Z" fill="#ffffff"/>
    <circle cx="50" cy="82" r="3" fill="#000000"/>
    <path d="M45 62 L45 74 L55 74 L55 62 Z" fill="#ffffff"/>
    <path d="M34 44 C34 60 41 68 50 68 C59 68 66 60 66 44 C66 32 59 26 50 26 C41 26 34 32 34 44 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
    <path d="M30 42 C28 26 38 20 50 20 C62 20 72 26 70 42 C65 32 57 28 50 28 C43 28 35 32 30 42 Z" fill="#000000"/>
    <path d="M32 38 C32 52 34 64 38 70 C35 62 34 50 34 38 Z" fill="#000000"/>
    <path d="M68 38 C68 52 66 64 62 70 C65 62 66 50 66 38 Z" fill="#000000"/>
    <g transform="translate(32, 34)">
      <circle cx="0" cy="0" r="2.5" fill="#ffffff" stroke="#000000" stroke-width="1"/>
      <path d="M-3 0 L3 0 M0 -3 L0 3" stroke="#000000" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="1" fill="#000000"/>
    </g>
    <g transform="translate(68, 34)">
      <circle cx="0" cy="0" r="2.5" fill="#ffffff" stroke="#000000" stroke-width="1"/>
      <path d="M-3 0 L3 0 M0 -3 L0 3" stroke="#000000" stroke-width="1.5"/>
      <circle cx="0" cy="0" r="1" fill="#000000"/>
    </g>
    <path d="M38 43 Q43 40 47 43" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M62 43 Q57 40 53 43" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M38 46 Q43 43 47 47" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="43" cy="50" rx="3.5" ry="4.5" fill="#000000"/>
    <circle cx="42" cy="48" r="1.5" fill="#ffffff"/>
    <circle cx="44" cy="52" r="0.8" fill="#ffffff"/>
    <path d="M53 47 Q57 43 62 46" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
    <ellipse cx="57" cy="50" rx="3.5" ry="4.5" fill="#000000"/>
    <circle cx="56" cy="48" r="1.5" fill="#ffffff"/>
    <circle cx="58" cy="52" r="0.8" fill="#ffffff"/>
    <circle cx="50" cy="57" r="0.7" fill="#000000"/>
    <path d="M46 62 Q50 65 54 62" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`,

  // 3. Ichigo Kurosaki (Boy 1) - Spiky hair, fierce brow, Zangetsu strap & Shihakusho
  `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#121212" stroke="#ffffff" stroke-width="2"/>
    <circle cx="50" cy="50" r="44" fill="#1e1e1e"/>
    <path d="M20 96 C20 78 32 70 44 68 L56 68 C68 70 80 78 80 96 Z" fill="#000000" stroke="#ffffff" stroke-width="1.5"/>
    <path d="M42 68 L50 82 L58 68" fill="#ffffff"/>
    <path d="M45 68 L50 78 L55 68" fill="#000000"/>
    <path d="M30 96 L65 68 L71 72 L36 96 Z" fill="#ffffff" stroke="#000000" stroke-width="1"/>
    <path d="M44 58 L44 70 L56 70 L56 58 Z" fill="#ffffff"/>
    <line x1="48" y1="62" x2="48" y2="69" stroke="#000000" stroke-width="1"/>
    <path d="M34 42 C34 58 42 67 50 67 C58 67 66 58 66 42 C66 30 58 24 50 24 C42 24 34 30 34 42 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
    <path d="M26 38 L22 28 L30 30 L28 18 L38 24 L42 12 L48 20 L56 10 L58 22 L68 14 L66 26 L76 22 L72 32 L80 34 L72 44 L68 36 C64 30 56 26 50 26 C42 26 34 30 30 36 Z" fill="#000000"/>
    <path d="M32 36 L38 44 L40 36 L46 45 L48 35 L54 44 L56 36 L62 44 L64 36" fill="#000000"/>
    <path d="M36 43 L46 46" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M64 43 L54 46" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="48" y1="44" x2="52" y2="44" stroke="#000000" stroke-width="1.5"/>
    <path d="M37 47 L45 49 L44 52 L38 51 Z" fill="#000000"/>
    <circle cx="42" cy="49.5" r="1.5" fill="#ffffff"/>
    <circle cx="43" cy="49.5" r="0.7" fill="#000000"/>
    <path d="M63 47 L55 49 L56 52 L62 51 Z" fill="#000000"/>
    <circle cx="58" cy="49.5" r="1.5" fill="#ffffff"/>
    <circle cx="57" cy="49.5" r="0.7" fill="#000000"/>
    <path d="M49 53 L51 57 L48 58" stroke="#000000" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M44 62 Q49 63 56 60" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
    <line x1="48" y1="65" x2="52" y2="65" stroke="#000000" stroke-width="1"/>
  </svg>`,

  // 4. Kisuke Urahara (Boy 2) - Striped bucket hat, haori collar, shadowed grin & stubble
  `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#121212" stroke="#ffffff" stroke-width="2"/>
    <circle cx="50" cy="50" r="44" fill="#1e1e1e"/>
    <path d="M20 96 C20 78 32 72 44 70 L56 70 C68 72 80 78 80 96 Z" fill="#000000" stroke="#ffffff" stroke-width="1.5"/>
    <path d="M42 70 L50 84 L58 70" fill="#ffffff"/>
    <polygon points="46,74 50,78 46,82 42,78" fill="#000000"/>
    <polygon points="54,74 58,78 54,82 50,78" fill="#000000"/>
    <line x1="50" y1="84" x2="50" y2="96" stroke="#ffffff" stroke-width="1.5"/>
    <path d="M44 60 L44 72 L56 72 L56 60 Z" fill="#ffffff"/>
    <path d="M34 44 C34 58 42 67 50 67 C58 67 66 58 66 44 L66 38 L34 38 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
    <path d="M26 44 C26 56 30 64 34 68 C33 60 32 50 32 44 Z" fill="#000000"/>
    <path d="M74 44 C74 56 70 64 66 68 C67 60 68 50 68 44 Z" fill="#000000"/>
    <path d="M36 44 L40 54 L44 44 L48 52 L52 44 L56 54 L60 44 L64 52" fill="#000000"/>
    <path d="M30 36 C30 18 40 12 50 12 C60 12 70 18 70 36 Z" fill="#ffffff" stroke="#000000" stroke-width="2"/>
    <path d="M36 36 C36 24 40 16 42 13 L45 13 C43 18 41 26 41 36 Z" fill="#000000"/>
    <path d="M48 36 L48 12 L52 12 L52 36 Z" fill="#000000"/>
    <path d="M59 36 C59 26 57 18 55 13 L58 13 C60 16 64 24 64 36 Z" fill="#000000"/>
    <ellipse cx="50" cy="37" rx="28" ry="7" fill="#000000" stroke="#ffffff" stroke-width="1.5"/>
    <path d="M34 38 Q50 48 66 38 L66 48 Q50 56 34 48 Z" fill="#000000" opacity="0.45"/>
    <path d="M40 48 Q44 46 47 48" stroke="#000000" stroke-width="2"/>
    <circle cx="43.5" cy="50" r="1.5" fill="#000000"/>
    <path d="M60 48 Q56 46 53 48" stroke="#000000" stroke-width="2"/>
    <circle cx="56.5" cy="50" r="1.5" fill="#000000"/>
    <path d="M49 55 L51 57 L49 58" stroke="#000000" stroke-width="1.2"/>
    <path d="M44 62 Q50 66 56 61" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
    <circle cx="48" cy="65" r="0.6" fill="#000000"/>
    <circle cx="50" cy="65.5" r="0.6" fill="#000000"/>
    <circle cx="52" cy="65" r="0.6" fill="#000000"/>
  </svg>`,

  // 5. Toshiro Hitsugaya (Boy 3) - Spiky silver hair, Captain Haori, Squad 10 sash & star ornament
  `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#121212" stroke="#ffffff" stroke-width="2"/>
    <circle cx="50" cy="50" r="44" fill="#1e1e1e"/>
    <path d="M20 96 C20 78 32 70 44 68 L56 68 C68 70 80 78 80 96 Z" fill="#ffffff" stroke="#000000" stroke-width="2"/>
    <path d="M40 68 L50 82 L60 68 Z" fill="#000000"/>
    <path d="M45 68 L50 76 L55 68" fill="#ffffff"/>
    <path d="M28 96 L62 68 L68 72 L34 96 Z" fill="#000000" stroke="#ffffff" stroke-width="1"/>
    <circle cx="50" cy="80" r="3" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
    <path d="M45 58 L45 70 L55 70 L55 58 Z" fill="#ffffff"/>
    <path d="M35 44 C35 58 42 66 50 66 C58 66 65 58 65 44 C65 32 58 26 50 26 C42 26 35 32 35 44 Z" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
    <path d="M26 36 L18 26 L28 26 L26 14 L36 20 L40 8 L48 18 L54 6 L58 18 L68 10 L66 22 L76 18 L72 30 L82 30 L74 42 L68 34 C64 28 56 24 50 24 C44 24 36 28 32 34 Z" fill="#ffffff" stroke="#000000" stroke-width="2"/>
    <path d="M34 34 L38 46 L42 36 L48 48 L52 36 L58 46 L64 36" fill="#ffffff" stroke="#000000" stroke-width="1.5"/>
    <path d="M38 44 L46 47" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M62 44 L54 47" stroke="#000000" stroke-width="2.5" stroke-linecap="round"/>
    <line x1="48" y1="45" x2="52" y2="45" stroke="#000000" stroke-width="1.5"/>
    <path d="M38 47 L46 49 L44 53 L39 52 Z" fill="#000000"/>
    <circle cx="43" cy="50" r="1.5" fill="#ffffff"/>
    <circle cx="43.5" cy="50" r="0.6" fill="#000000"/>
    <path d="M62 47 L54 49 L56 53 L61 52 Z" fill="#000000"/>
    <circle cx="57" cy="50" r="1.5" fill="#ffffff"/>
    <circle cx="56.5" cy="50" r="0.6" fill="#000000"/>
    <path d="M49 54 L51 57 L49 57.5" stroke="#000000" stroke-width="1.5"/>
    <line x1="46" y1="62" x2="54" y2="62" stroke="#000000" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
] as const;

/**
 * Returns a data URL for an SVG avatar by index.
 */
export function getAvatarDataUri(index: number): string {
  const safeIndex = Math.abs(Math.floor(index)) % SKETCH_AVATARS.length;
  const svg = SKETCH_AVATARS[safeIndex] ?? SKETCH_AVATARS[0];
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Returns the Bleach character metadata for a given avatar index.
 */
export function getBleachAvatarMeta(index: number): BleachAvatarMeta {
  const safeIndex = Math.abs(Math.floor(index)) % BLEACH_AVATARS_META.length;
  return BLEACH_AVATARS_META[safeIndex] ?? BLEACH_AVATARS_META[0];
}
