/**
 * Strict Content Moderation, Anti-Abuse, and Quality Validation Engine
 *
 * Implements world-class enterprise safety and linguistic standards:
 * 1. Prohibited Entities & Terrorist Filter ("laden", "ben laden", global/regional terrorist entities)
 * 2. Full Complete Legal/Professional Name Enforcement (no nicknames, minimum first & last name)
 * 3. Strict Professional Role Verification (canonical role registry + verified professional title heuristics)
 * 4. Death Threat & Physical Harm Prevention
 * 5. Automated Bot, Spam & Keyboard Smash Detection ("auto detect comment")
 * 6. Hate Speech, Bigotry & Racial Slurs Filter
 * 7. Insult & Derogatory Toxicity Filter ("stupid", "idiot", etc.)
 * 8. "Nag mumura" (Tagalog profanities, cursing, and vulgarities)
 * 9. Tagalog Language Restriction (Enforces international English for global audience)
 * 10. Destructive Bashing, Intimidation & Malicious Jealousy Prevention
 * 11. Strict English Grammar, Sentence Structure & Punctuation Quality
 *
 * Adheres to Clean Architecture, TypeScript 6/7, Bun, and Aurora Scharff best practices.
 */

// ─────────────────────────────────────────────────────────────────────────────
// 1. CANONICAL PROFESSIONAL ROLES REGISTRY
// ─────────────────────────────────────────────────────────────────────────────

export const VERIFIED_ROLES: readonly string[] = Object.freeze([
  // Engineering & Software Development
  'Software Engineer',
  'Senior Software Engineer',
  'Staff Software Engineer',
  'Principal Software Engineer',
  'Frontend Engineer',
  'Senior Frontend Engineer',
  'Backend Engineer',
  'Senior Backend Engineer',
  'Full Stack Developer',
  'Senior Full Stack Developer',
  'Mobile Application Developer',
  'iOS Developer',
  'Android Developer',
  'DevOps Engineer',
  'Cloud Infrastructure Engineer',
  'Site Reliability Engineer (SRE)',
  'Systems Architect',
  'Solutions Architect',
  'Enterprise Architect',
  'Database Administrator (DBA)',
  'Security Engineer',
  'Cybersecurity Analyst',
  'AI / Machine Learning Engineer',
  'Data Scientist',
  'Data Engineer',
  'QA Engineer',
  'Automation Test Engineer',
  'Embedded Systems Engineer',
  'Firmware Engineer',

  // Product, Design & Architecture
  'UI/UX Designer',
  'Senior UI/UX Designer',
  'Product Designer',
  'Lead Product Designer',
  'Visual Designer',
  'Interaction Designer',
  'Product Manager',
  'Technical Product Manager',
  'Project Manager',
  'Scrum Master',
  'Agile Coach',

  // Executive & Technical Leadership
  'Tech Lead',
  'Engineering Manager',
  'Director of Engineering',
  'VP of Engineering',
  'Chief Technology Officer (CTO)',
  'Chief Executive Officer (CEO)',
  'Founder / Co-Founder',

  // Collaboration, Academic & Mentorship
  'Colleague / Team Member',
  'Senior Colleague / Peer',
  'Technical Mentor / Advisor',
  'Capstone Partner / Teammate',
  'Research Fellow / Scientist',
  'Professor / Academic Instructor',
  'Student / Classmate',
  'Client / Commercial Partner',
  'Independent Consultant',
  'IT Consultant / Specialist',
  'Open Source Collaborator',
]);

// Set of recognized job title keywords for custom role validation
const VALID_ROLE_KEYWORDS: ReadonlySet<string> = new Set([
  'engineer',
  'developer',
  'designer',
  'manager',
  'lead',
  'architect',
  'director',
  'analyst',
  'scientist',
  'consultant',
  'specialist',
  'administrator',
  'officer',
  'executive',
  'coordinator',
  'mentor',
  'advisor',
  'professor',
  'instructor',
  'teacher',
  'student',
  'classmate',
  'colleague',
  'partner',
  'founder',
  'researcher',
  'fellow',
  'tester',
  'intern',
  'associate',
  'contractor',
  'freelancer',
  'auditor',
  'technician',
  'programmer',
  'creator',
  'contributor',
  'supervisor',
  'practitioner',
  'software',
]);

// ─────────────────────────────────────────────────────────────────────────────
// 2. NORMALIZATION ROUTINES FOR ANTI-EVASION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes input text by converting leetspeak, stripping accents, and standardizing casing.
 * Defeats common filter evasion tactics (e.g. "l4d3n", "b1n l4d3n", "l.a.d.e.n").
 */
export function normalizeEvasion(input: string): string {
  if (!input) return '';

  // 1. Lowercase and strip unicode diacritics / accents (é -> e, etc.)
  let normalized = input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '');

  // 2. Map standard leetspeak substitutions
  normalized = normalized
    .replace(/@/g, 'a')
    .replace(/4/g, 'a')
    .replace(/8/g, 'b')
    .replace(/3/g, 'e')
    .replace(/1/g, 'i')
    .replace(/!/g, 'i')
    .replace(/0/g, 'o')
    .replace(/5/g, 's')
    .replace(/\$/g, 's')
    .replace(/7/g, 't')
    .replace(/\+/g, 't');

  return normalized;
}

/**
 * Strips all non-alphanumeric separator characters to detect spaced-out or punctuated evasion.
 */
export function stripSeparators(input: string): string {
  return input.replace(/[\s\-_.,/\\*#@^~`'"|;:()[\]{}]+/g, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. PROHIBITED ENTITIES & TERRORISM DETECTION
// ─────────────────────────────────────────────────────────────────────────────

const TERRORIST_PATTERNS: readonly RegExp[] = [
  // Osama bin Laden / "laden" variants explicitly forbidden by user prompt
  /\bladen\b/i,
  /\bbin[\s\-_.]+laden\b/i,
  /\bben[\s\-_.]+laden\b/i,
  /\bosama\b/i,
  /\busama\b/i,

  // Global and regional terrorist / extremist groups
  /\b(isis|isil|daesh|daish|islamic\s+state)\b/i,
  /\bal[\s\-_.]*qa[eai]da\b/i,
  /\btaliban\b/i,
  /\bboko[\s\-_.]+haram\b/i,
  /\babu[\s\-_.]+sayyaf\b/i,
  /\bjemaah[\s\-_.]+islami[y]?ah\b/i,
  /\b(cpp[\s\-_.]*npa|new\s+people'?s\s+army)\b/i,
  /\bhamas\b/i,
  /\bhe[z|s]bollah\b/i,
  /\bhizbullah\b/i,
  /\bal[\s\-_.]*shabaab\b/i,
  /\blashkar[\s\-_.]+e[\s\-_.]+taiba\b/i,
  /\bjaish[\s\-_.]+e[\s\-_.]+mohammed\b/i,
  /\baum[\s\-_.]+shinrikyo\b/i,
  /\bsendero[\s\-_.]+luminoso\b/i,
  /\bshining[\s\-_.]+path\b/i,
  /\bhaqqani\b/i,
  /\bku[\s\-_.]+klux[\s\-_.]+klan\b/i,
  /\bkkk\b/i,
  /\baryan[\s\-_.]+brotherhood\b/i,
  /\batomwaffen\b/i,
];

const TERRORIST_STRIPPED_KEYWORDS: readonly string[] = [
  'laden',
  'binladen',
  'benladen',
  'osamabinladen',
  'alqaeda',
  'alqaida',
  'bokoharam',
  'abusayyaf',
  'daesh',
  'jemaahislamiyah',
  'senderoluminoso',
  'kukluxklan',
];

/**
 * Verifies that the string does not reference Osama bin Laden or any terrorist/extremist groups.
 */
export function containsTerroristOrProhibitedEntity(input: string): boolean {
  if (!input) return false;

  const normalized = normalizeEvasion(input);
  const stripped = stripSeparators(normalized);

  // Check direct regex patterns on normalized text
  for (const pattern of TERRORIST_PATTERNS) {
    if (pattern.test(normalized)) {
      return true;
    }
  }

  // Check stripped strings against condensed targets
  for (const keyword of TERRORIST_STRIPPED_KEYWORDS) {
    if (stripped.includes(keyword)) {
      return true;
    }
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3.5. BULLY WORDS & TARGETED HARASSMENT PROTECTION
// ─────────────────────────────────────────────────────────────────────────────

export const BULLY_WORDS: readonly string[] = [
  'palero',
  'laden',
  'alden',
  'aldin',
  'ben laden',
  'bin laden',
  'bin odam',
  'kamatis',
  'benladen',
  'binladen',
  'binodam',
  'ben ladin',
  'bin ladin',
  'benladin',
  'binladin',
  'osama',
];

/**
 * Checks if input contains any targeted bully words or obfuscated evasion patterns.
 */
export function containsBullyWords(input: string): boolean {
  if (!input) return false;
  const normalized = normalizeEvasion(input).toLowerCase();
  const stripped = stripSeparators(normalized).toLowerCase();

  for (const b of BULLY_WORDS) {
    if (normalized.includes(b)) return true;
    const strippedB = stripSeparators(b).toLowerCase();
    if (strippedB && stripped.includes(strippedB)) return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. DEATH THREATS & PHYSICAL HARM DETECTION
// ─────────────────────────────────────────────────────────────────────────────

const DEATH_THREAT_PATTERNS: readonly RegExp[] = [
  /\b(?:i(?:'ll|\s+will|\s+am\s+going\s+to|'m\s+gonna)\s+)?kill\s+(?:you|your)\b/i,
  /\b(?:gonna|going\s+to)\s+(?:murder|execute|slaughter|stab|shoot|hang)\s+you\b/i,
  /\bmurder\s+you\b/i,
  /\b(?:assassinate|execute|behead|decapitate)\s+you\b/i,
  /\b(?:slit|cut)\s+your\s+throat\b/i,
  /\bput\s+a\s+bullet\s+in\s+(?:you|your\s+head)\b/i,
  /\bstrangle\s+you\b/i,
  /\bblow\s+you\s+up\b/i,
  /\bbomb\s+your\b/i,
  /\bhope\s+you\s+(?:die|burn|choke)\b/i,
  /\bwish\s+you\s+were\s+dead\b/i,
  /\bgo\s+die\b/i,
  /\bdie\s+in\s+a\s+fire\b/i,
  /\bdrop\s+dead\b/i,
  /\bkill\s+yourself\b/i,
  /\bcommit\s+suicide\b/i,
  /\bend\s+your\s+life\b/i,
  /\bi\s+will\s+hunt\s+you\s+down\b/i,
  // Filipino/Tagalog death threats
  /\bpatayin\s+kita\b/i,
  /\bmamatay\s+ka\s+(?:na)?\b/i,
  /\bipapapatay\s+kita\b/i,
];

export function containsDeathThreat(input: string): boolean {
  if (!input) return false;
  const normalized = normalizeEvasion(input);
  return DEATH_THREAT_PATTERNS.some((pattern) => pattern.test(normalized));
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. AUTOMATED BOT, SPAM & KEYBOARD GIBBERISH DETECTION ("auto detect comment")
// ─────────────────────────────────────────────────────────────────────────────

const URL_AND_PROMO_PATTERNS: readonly RegExp[] = [
  /https?:\/\/[^\s]+/i,
  /www\.[a-z0-9-]+\.[a-z]{2,}/i,
  /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i,
  /\b[a-z0-9-]+\.(?:com|org|net|xyz|ru|cn|io|me|tk|biz|info|top|club|online)\b/i,
  /\b(?:telegram|discord|wa\.me|whatsapp)\b/i,
  /\b(?:crypto|bitcoin|ethereum|binance|forex|airdrop|passive\s+income|earn\s+\$|free\s+money)\b/i,
];

export function isAutomatedSpamOrBot(input: string): boolean {
  if (!input) return false;

  // 1. Web links, domains, or promo handles
  if (URL_AND_PROMO_PATTERNS.some((pattern) => pattern.test(input))) {
    return true;
  }

  // 2. Unusually long character repetitions (e.g. "aaaaaa", "looooool", "!!!!!!")
  if (/(.)\1{4,}/.test(input)) {
    return true;
  }

  // 3. Repeated duplicate words in sequence (e.g. "great great great great", "nice nice nice nice")
  if (/\b(\w+)\b(?:\s+\1\b){3,}/i.test(input)) {
    return true;
  }

  // 4. Keyboard smash / unpronounceable consonant clusters (6+ consonants in a row)
  if (/[bcdfghjklmnpqrstvwxz]{6,}/i.test(input)) {
    return true;
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. RACIST, BIGOTED & HATE SPEECH DETECTION
// ─────────────────────────────────────────────────────────────────────────────

const HATE_SPEECH_PATTERNS: readonly RegExp[] = [
  /\b(?:nigger|nigga|negro|niggaz)\b/i,
  /\b(?:chink|gook|jap|wetback|beaner|kike|spic|coolie)\b/i,
  /\b(?:faggot|dyke|tranny)\b/i,
  /\b(?:white\s+supremacy|white\s+power|heil\s+hitler|1488)\b/i,
  /\b(?:subhuman|mongrel|racial\s+slur)\b/i,
];

export function containsHateSpeech(input: string): boolean {
  if (!input) return false;
  const normalized = normalizeEvasion(input);
  return HATE_SPEECH_PATTERNS.some((pattern) => pattern.test(normalized));
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. TOXICITY, INSULTS & DEROGATORY ATTACKS ("stupid", "idiot", etc.)
// ─────────────────────────────────────────────────────────────────────────────

const INSULT_PATTERNS: readonly RegExp[] = [
  /\bstupid\b/i,
  /\bidiot\b/i,
  /\bdumb(?:ass)?\b/i,
  /\bmoron(?:ic)?\b/i,
  /\bretard(?:ed)?\b/i,
  /\bimbecile\b/i,
  /\bfool(?:ish)?\b/i,
  /\bclown\b/i,
  /\bloser\b/i,
  /\bjerk\b/i,
  /\bworthless\b/i,
  /\bincompetent\b/i,
  /\bignorant\b/i,
  /\bpathetic\b/i,
  /\bbrainless\b/i,
  /\bbastard\b/i,
  /\basshole\b/i,
  /\bbitch\b/i,
  /\bdick(?:head)?\b/i,
  /\bcunt\b/i,
  /\bfuck(?:ing|er)?\b/i,
  /\bshit(?:head)?\b/i,
  /\bbullshit\b/i,
  /\bpalero\b/i,
  /\b(?:ben|bin)[\s\-_.]*(?:laden|ladin|odam)\b/i,
  /\bladen\b/i,
  /\balden\b/i,
  /\baldin\b/i,
  /\bkamatis\b/i,
];

export function containsInsultsOrToxicity(input: string): boolean {
  if (!input) return false;
  const normalized = normalizeEvasion(input);
  return INSULT_PATTERNS.some((pattern) => pattern.test(normalized));
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. "NAG MUMURA" (TAGALOG PROFANITY & VULGARITY)
// ─────────────────────────────────────────────────────────────────────────────

const TAGALOG_PROFANITY_PATTERNS: readonly RegExp[] = [
  /\bputang[\s\-_.]*ina(?:mo)?\b/i,
  /\btang[\s\-_.]*ina(?:mo)?\b/i,
  /\bpukinang[\s\-_.]*ina\b/i,
  /\bkingina(?:mo)?\b/i,
  /\bputa(?:ng)?\b/i,
  /\bpota(?:ng)?\b/i,
  /\bgago(?:ng|s)?\b/i,
  /\btarantado(?:ng)?\b/i,
  /\bulol\b/i,
  /\bpunyeta\b/i,
  /\bbuwisit\b/i,
  /\bbwisit\b/i,
  /\bhayop[\s\-_.]+ka\b/i,
  /\bkupal\b/i,
  /\bleche\b/i,
  /\bletse\b/i,
  /\bpakyu\b/i,
  /\bhinayupak\b/i,
  /\blintik\b/i,
  /\bpokpok\b/i,
  /\bbobo(?:ng)?\b/i,
  /\btanga(?:ng)?\b/i,
  /\binutil\b/i,
  /\bengot\b/i,
  /\bungas\b/i,
  /\byawa\b/i,
  /\bbilat\b/i,
  /\bpeste\b/i,
  /\bkantot(?:an)?\b/i,
  /\bjakol\b/i,
  /\btamod\b/i,
  /\bburat\b/i,
  /\bpuke\b/i,
  /\btiti\b/i,
  /\bbayag\b/i,
  /\bogag\b/i,
];

export function containsTagalogProfanity(input: string): boolean {
  if (!input) return false;
  const normalized = normalizeEvasion(input);
  return TAGALOG_PROFANITY_PATTERNS.some((pattern) => pattern.test(normalized));
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. TAGALOG LANGUAGE RESTRICTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Common high-frequency Tagalog / Filipino marker words.
 * The prompt requires English-only for worldwide reach and safety.
 */
const TAGALOG_MARKER_WORDS: ReadonlySet<string> = new Set([
  'ang',
  'mga',
  'nang',
  'para',
  'ito',
  'iyon',
  'dito',
  'doon',
  'siya',
  'nila',
  'kami',
  'tayo',
  'kayo',
  'sila',
  'naman',
  'talaga',
  'pero',
  'ngunit',
  'kasi',
  'dahil',
  'kung',
  'kapag',
  'maganda',
  'pangit',
  'kumusta',
  'salamat',
  'mahusay',
  'galing',
  'masaya',
  'maraming',
  'napaka',
  'sobrang',
  'natin',
  'namin',
  'inyo',
  'amin',
  'kanila',
  'lahat',
  'gusto',
  'ayaw',
  'wala',
  'meron',
  'mayroon',
  'sana',
  'tsaka',
  'habang',
  'tuwing',
  'bawat',
  'maging',
  'huwag',
  'napakagaling',
  'magaling',
  'kanya',
  'niya',
]);

/**
 * Detects if a comment is written in Tagalog/Filipino rather than English.
 * Flags if 2 or more distinct Tagalog marker words are present.
 */
export function isTagalogLanguage(input: string): boolean {
  if (!input) return false;

  const words = input
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  let tagalogMatchCount = 0;
  const matchedTokens = new Set<string>();

  for (const word of words) {
    if (TAGALOG_MARKER_WORDS.has(word) && !matchedTokens.has(word)) {
      matchedTokens.add(word);
      tagalogMatchCount++;
      if (tagalogMatchCount >= 2) {
        return true;
      }
    }
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// 10. INTIMIDATION, BASHING & MALICIOUS JEALOUSY
// ─────────────────────────────────────────────────────────────────────────────

const INTIMIDATION_AND_BASHING_PATTERNS: readonly RegExp[] = [
  /\bwatch\s+your\s+back\b/i,
  /\byou\s+(?:will|'ll)\s+(?:regret|pay\s+for)\s+this\b/i,
  /\bi\s+will\s+(?:expose|ruin|destroy)\s+you\b/i,
  /\bruin\s+your\s+(?:career|life|reputation)\b/i,
  /\bdestroy\s+your\s+(?:reputation|career)\b/i,
  /\b(?:dox|blacklist)\s+you\b/i,
  /\bleak\s+your\s+(?:data|info|address)\b/i,
  /\byou\s+don'?t\s+deserve\b/i,
  /\bfake\s+(?:developer|coder|programmer|engineer)\b/i,
  /\b(?:fraud|scammer|fraudulent)\b/i,
  /\b(?:cheater|cheat|plagiarized|copied\s+everything|stole\s+the\s+code)\b/i,
  /\btalentless\b/i,
  /\bnobody\s+likes\s+you\b/i,
  /\bjealous(?:y)?\b/i,
  /\benvy\s+you\b/i,
  /\bworst\s+(?:developer|coder|engineer)\b/i,
  /\bhorrible\s+(?:programmer|developer|work)\b/i,
  /\bcomplete\s+garbage\b/i,
  /\bwaste\s+of\s+time\b/i,
  /\bhope\s+you\s+fail\b/i,
  /\byou\s+will\s+fail\b/i,
  /\byou\s+have\s+no\s+skills\b/i,
  /\byou\s+know\s+nothing\b/i,
];

export function containsIntimidationOrBashing(input: string): boolean {
  if (!input) return false;
  const normalized = normalizeEvasion(input);
  return INTIMIDATION_AND_BASHING_PATTERNS.some((pattern) => pattern.test(normalized));
}

// ─────────────────────────────────────────────────────────────────────────────
// 11. STRICT GRAMMAR & LINGUISTIC QUALITY VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

const GENERIC_TROLL_NAMES = new Set([
  'john doe',
  'jane doe',
  'anonymous user',
  'anonymous',
  'no name',
  'test user',
  'admin',
  'moderator',
  'unknown',
  'guest user',
  'someone else',
  'nobody',
]);

/**
 * Validates full complete legal or professional names.
 * - Minimum 2 distinct words (first name + last name)
 * - Minimum 4 characters, max 60
 * - No single-word nicknames or fragments
 * - No numbers, symbols, links, or bot characters
 * - No terrorist entities or "laden"
 */
export function validateNameString(val: string): string | null {
  const trimmed = val.trim();

  if (!trimmed) {
    return 'Please enter your full complete name.';
  }

  if (trimmed.length < 4) {
    return 'Name must be at least 4 characters in length.';
  }

  if (trimmed.length > 60) {
    return 'Name cannot exceed 60 characters.';
  }

  // Check prohibited terrorist names and "laden"
  if (containsTerroristOrProhibitedEntity(trimmed)) {
    return 'For security and compliance, this name cannot be accepted.';
  }

  // Check prohibited bully words, harassment nicknames, and targeted insults
  if (containsBullyWords(trimmed)) {
    return 'For security, professionalism, and safety, this name cannot be accepted.';
  }

  // Name character integrity check: Unicode letters, spaces, hyphens, single apostrophes, and dot (middle initials)
  if (!/^[\p{L}][\p{L}\s.'’-]*[\p{L}.]$/u.test(trimmed)) {
    return 'Name must contain only letters, spaces, hyphens, and apostrophes.';
  }

  // Multi-part verification: first and last name required
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return 'Please enter your full complete name. Nicknames are not permitted.';
  }

  // Validate each segment
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    // Middle initial allows 1 letter + dot e.g. "A."
    if (part.length === 2 && part.endsWith('.')) {
      continue;
    }
    if (part.length < 2) {
      return 'Each part of your name must be at least 2 characters.';
    }
  }

  // Troll or placeholder name check
  if (GENERIC_TROLL_NAMES.has(trimmed.toLowerCase())) {
    return 'Please enter your genuine legal or professional name.';
  }

  return null;
}

/**
 * Validates that a role is strictly valid and professional.
 * - Required
 * - Matches either a canonical role OR a verified professional job title format
 * - No numbers, spam, or abusive language
 */
export function validateRoleString(val: string): string | null {
  const trimmed = val.trim();

  if (!trimmed) {
    return 'Role is required. Please select or enter a valid professional role.';
  }

  if (trimmed.length < 3) {
    return 'Role must be at least 3 characters.';
  }

  if (trimmed.length > 120) {
    return 'Role cannot exceed 120 characters.';
  }

  // Role character integrity check: letters, spaces, hyphens, slashes, ampersands, periods, commas, pipes
  if (!/^[\p{L}][\p{L}\s/&.,'|-]*[\p{L}.]$/u.test(trimmed)) {
    return 'Role must contain only professional title letters, spaces, hyphens, slashes, ampersands, and pipes.';
  }

  // Safety checks
  if (containsTerroristOrProhibitedEntity(trimmed) || containsBullyWords(trimmed)) {
    return 'Prohibited organization, bully term, or entity name detected in role.';
  }
  if (containsInsultsOrToxicity(trimmed) || containsHateSpeech(trimmed) || containsTagalogProfanity(trimmed)) {
    return 'Role contains unacceptable or offensive language.';
  }

  // 1. Direct match with verified roles
  const lowerTrimmed = trimmed.toLowerCase();
  const isDirectCanonicalMatch = VERIFIED_ROLES.some(
    (role) => role.toLowerCase() === lowerTrimmed,
  );
  if (isDirectCanonicalMatch) {
    return null;
  }

  // 2. Verified professional title heuristic (must contain at least one recognized title keyword)
  const roleTokens = lowerTrimmed
    .replace(/[^\p{L}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const hasRecognizedRoleKeyword = roleTokens.some((token) => VALID_ROLE_KEYWORDS.has(token));

  if (!hasRecognizedRoleKeyword) {
    return 'Please enter a recognized professional role or title.';
  }

  return null;
}

/**
 * Validates the recommendation comment against strict safety, toxicity, anti-abuse,
 * language policy, and English grammar standards.
 */
export function validateCommentString(val: string): string | null {
  const trimmed = val.trim();

  if (!trimmed) {
    return 'Please write a recommendation comment.';
  }

  // 1. Prohibited entities & terrorism (terrorist groups)
  if (containsTerroristOrProhibitedEntity(trimmed)) {
    return 'Comments is not allowed!!.';
  }

  // 1.5. Bully words & targeted harassment attacks
  if (containsBullyWords(trimmed)) {
    return 'Harassment and bully terms are strictly prohibited in recommendations.';
  }

  // 2. Death threats & violent harm
  if (containsDeathThreat(trimmed)) {
    return 'Violent language is not allowed!!.';
  }

  // 3. Automated bot & spam detection ("auto detect comment")
  if (isAutomatedSpamOrBot(trimmed)) {
    return 'Comment is not appropriate!!.';
  }

  // 4. Racist comment & hate speech
  if (containsHateSpeech(trimmed)) {
    return 'Hate comment not allowed!!.';
  }

  // 5. Toxicity & insults ("stupid", "idiot", etc.)
  if (containsInsultsOrToxicity(trimmed)) {
    return 'Please be Professional!!.';
  }

  // 6. Tagalog profanity ("nag mumura")
  if (containsTagalogProfanity(trimmed)) {
    return 'Profanity and vulgarities are strictly prohibited.';
  }

  // 7. Tagalog language restriction (English only requirement)
  if (isTagalogLanguage(trimmed)) {
    return 'Comment required english only!!.';
  }

  // 8. Intimidation, destructive bashing & malicious jealousy
  if (containsIntimidationOrBashing(trimmed)) {
    return 'Harassing, intimidating, destructive, or defamatory comments are strictly prohibited.';
  }

  // 9. Length bounds & word limit (Enterprise standard: up to 5,000 words)
  if (trimmed.length < 30) {
    return 'Recommendation must be at least 30 characters in length to provide meaningful feedback.';
  }

  if (trimmed.length > 50000) {
    return 'Recommendation cannot exceed 50,000 characters.';
  }

  // 10. Strict English Grammar, Punctuation & Quality Checks
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 6) {
    return 'Grammar check: Please write a complete recommendation of at least 6 words.';
  }

  if (words.length > 5000) {
    return 'Recommendation cannot exceed 5000 words.';
  }

  // 10a. Sentence Capitalization: First letter must be uppercase (or quote)
  const firstChar = trimmed.charAt(0);
  if (!/[A-Z"“']/.test(firstChar)) {
    return 'Grammar check: Please start your recommendation sentence with a capital letter.';
  }

  // 10b. No ALL-CAPS yelling
  const alphaChars = trimmed.replace(/[^a-zA-Z]/g, '');
  if (alphaChars.length >= 20) {
    const upperCount = (alphaChars.match(/[A-Z]/g) || []).length;
    if (upperCount / alphaChars.length > 0.6) {
      return 'Grammar check: Please do not write in ALL CAPS. Use standard sentence capitalization.';
    }
  }

  // 10c. Terminal Punctuation: Must end with '.', '!', '?', or closing quote
  const lastChar = trimmed.slice(-1);
  const secondLastChar = trimmed.length > 1 ? trimmed.slice(-2, -1) : '';
  const hasProperEndPunctuation =
    /[.!?]/.test(lastChar) ||
    ((lastChar === '"' || lastChar === '”' || lastChar === "'") && /[.!?]/.test(secondLastChar));

  if (!hasProperEndPunctuation) {
    return 'Grammar check: Please end your recommendation sentence with proper punctuation.';
  }

  // 10d. Punctuation Spacing: Comma/period/semicolon followed immediately by a letter without space
  if (/[,;:](?=[a-zA-Z])|\.(?=[a-zA-Z]{2,})/.test(trimmed)) {
    return 'Grammar check: Please ensure there is a space after punctuation marks.';
  }

  // 10e. Consecutive Word Duplication (stutter / repeated word, allowing standard English like 'that that' or 'had had')
  const dupMatch = trimmed.match(/\b([a-zA-Z]{2,})\s+\1\b/i);
  if (dupMatch) {
    const dupWord = dupMatch[1].toLowerCase();
    if (dupWord !== 'that' && dupWord !== 'had') {
      return 'Grammar check: Detected consecutive duplicate words. Please check your sentence phrasing.';
    }
  }

  // 10f. English Coherence & Vowel Integrity (catches unpronounceable keyboard smashes)
  const invalidTokens = words.filter((w) => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    // Ignore short abbreviations or numbers
    if (clean.length >= 4 && !/[aeiouy]/.test(clean)) {
      return true;
    }
    return false;
  });

  if (invalidTokens.length > 0) {
    return 'Grammar check: Incoherent English words detected. Please write in clear, grammatically sound English.';
  }

  return null;
}
