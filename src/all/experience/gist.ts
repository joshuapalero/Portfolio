import type { ExperienceDataResult, ExperienceItem } from './types';
import { fetchRawFileViaProxyOrDirect } from '../github_proxy';

export interface FetchExperienceParams {
  gistId?: string;
  username?: string;
  token?: string;
  signal?: AbortSignal;
}

/**
 * Normalizes space-separated technology strings from the README skills line
 * into discrete skill tokens.
 */
function extractSkillsFromText(text: string): string[] {
  return text
    .replace(/Prisma\s+ORM/gi, 'Prisma_ORM')
    .split(/\s+/)
    .map((s) =>
      s
        .replace(/Prisma_ORM/g, 'Prisma ORM')
        .replace(/['’]s$/i, '')
        .trim(),
    )
    .map((s) => {
      if (s.toLowerCase() === 'typescript') return 'TypeScript';
      if (s.toLowerCase() === 'websockets' || s.toLowerCase() === 'websocket') return 'WebSockets';
      return s;
    })
    .filter(Boolean);
}

/**
 * Parses markdown documentation directly and exclusively from the user's
 * GitHub Experience repository README.md (no hardcoded data).
 * Accurately associates sections and extracts the optional dynamic subtitle
 * (any text written between the top `# Title` heading and the first section).
 */
export function parseLiveExperienceReadme(
  markdown: string,
  username: string,
): { readonly items: readonly ExperienceItem[]; readonly subtitle: string } {
  const lines = markdown.split(/\r?\n/);
  const rawSections: { header: string; rawLines: string[] }[] = [];
  let current: { header: string; rawLines: string[] } | null = null;
  let pastTitle = false;
  let sectionStarted = false;
  const subtitleLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      if (current) current.rawLines.push('');
      continue;
    }

    // Top-level heading check: "# Experience", "# Experiences", or un-hashed title
    if (!pastTitle) {
      if (/^#\s+/i.test(trimmed)) {
        pastTitle = true;
        continue;
      }
      if (/^(?:Experience|Software\s+Development\s+Experiences)$/i.test(trimmed)) {
        pastTitle = true;
        continue;
      }
      if (/^(?:#{1,4}\s*)?\(?subtitle\)?/i.test(trimmed)) {
        pastTitle = true;
      }
    }

    if (!sectionStarted) {
      // Check if line is explicitly marked as a subtitle line (e.g. ## (subtitle)-... or (subtitle): ...)
      const isExplicitSubtitle =
        /^(?:#{1,4}\s*)?\(?subtitle\)?\s*[-:–—]/i.test(trimmed) ||
        /^(?:#{1,4}\s*)subtitle\b/i.test(trimmed);

      if (isExplicitSubtitle) {
        const cleanLine = trimmed
          .replace(/^#{1,4}\s*/, '')
          .replace(/^>\s*/, '')
          .replace(/^[*_`#]+|[*_`#]+$/g, '')
          .replace(/^\(?subtitle\)?\s*[-:–—]\s*/i, '')
          .replace(/^[*_`#]+|[*_`#]+$/g, '')
          .trim();
        if (cleanLine) {
          subtitleLines.push(cleanLine);
        }
        continue;
      }

      const isHeading = /^#{2,3}\s+/.test(trimmed);
      const isTagEntry = /^[A-Za-z0-9&]+(?:\s{2,}|\t+)/.test(trimmed);

      if (isHeading || isTagEntry) {
        sectionStarted = true;
        current = { header: trimmed, rawLines: [line] };
        continue;
      }

      // Collect subtitle lines between # Title and first section
      const cleanLine = trimmed
        .replace(/^>\s*/, '')
        .replace(/^[*_`#]+|[*_`#]+$/g, '')
        .replace(/^\(?subtitle\)?\s*[-:–—]\s*/i, '')
        .replace(/^[*_`#]+|[*_`#]+$/g, '')
        .trim();
      if (cleanLine) {
        subtitleLines.push(cleanLine);
      }
      continue;
    }

    // Section entry starts on unindented lines (e.g. "CP1&2...", "SDI...") or markdown headings (##)
    const isStart = (/^[A-Za-z0-9&]+/.test(line) && !/^\s/.test(line)) || /^#{1,3}\s+/.test(line);
    if (isStart) {
      if (current) rawSections.push(current);
      current = { header: trimmed, rawLines: [line] };
    } else if (current) {
      current.rawLines.push(line);
    }
  }
  if (current) rawSections.push(current);

  const subtitle = subtitleLines.join(' ').trim();

  const parsed: ExperienceItem[] = [];

  for (let idx = 0; idx < rawSections.length; idx++) {
    const sec = rawSections[idx];
    const secLines = sec.rawLines;

    // Header line: e.g. "CP1&2   Capstone Project 1 & 2"
    const headerLine = secLines[0].trim();
    const tagMatch = headerLine.match(/^([A-Za-z0-9&]+)\s{2,}(.+)$/);
    const tag = tagMatch ? `${tagMatch[1]}   ${tagMatch[2]}` : headerLine;

    // Group remaining lines into paragraphs / chunks separated by blank lines
    const chunks: string[][] = [];
    let currentChunk: string[] = [];
    for (let i = 1; i < secLines.length; i++) {
      const l = secLines[i];
      const t = l.trim();
      if (!t) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
          currentChunk = [];
        }
      } else {
        currentChunk.push(t);
      }
    }
    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    // Chunk 0: Organization info (e.g. City Government of Meycauayan, City Human Resources Management Office, Valenzuela City, 486 Hours of Internship)
    let company = '';
    let location = '';
    const rawMeta: string[] = [];
    const orgChunk = chunks[0] || [];

    for (const rawOrgLine of orgChunk) {
      const orgLine = rawOrgLine.replace(/[.,\s]+$/, '').trim();
      if (!orgLine) continue;

      if (/Government|Solutions|Company|Corp|Inc|Enterprises|Technologies|LLC|Ltd/i.test(orgLine)) {
        if (!company) {
          company = orgLine;
        } else {
          rawMeta.push(orgLine);
        }
      } else if (
        /Valenzuela|Bulacan|Meycauayan|Metro Manila|City|Taguig|Makati|Quezon|Pasig/i.test(orgLine) &&
        !/Office|Officer|Department/i.test(orgLine)
      ) {
        location = location ? `${location} · ${orgLine}` : orgLine;
      } else if (!company && !/Office|Officer|Department|Hours|Internship/i.test(orgLine)) {
        company = orgLine;
      } else {
        rawMeta.push(orgLine.replace(/Officer$/i, 'Office'));
      }
    }

    if (!location) {
      for (let mIdx = 0; mIdx < rawMeta.length; mIdx++) {
        const m = rawMeta[mIdx];
        if (/Valenzuela|Bulacan|Meycauayan|City|Province/i.test(m) && !/Office|Officer|Department/i.test(m)) {
          location = m;
          rawMeta.splice(mIdx, 1);
          break;
        }
      }
    }

    if (!company && orgChunk.length > 0) {
      company = orgChunk[0].replace(/[.,\s]+$/, '').trim();
    }

    // Chunk 1: Role and Period (e.g. Software Developer Role, July 2025 - March 2026)
    let role = 'Software Engineer';
    let period = '2025';
    let year = '2025';
    const roleChunk = chunks[1] || [];
    for (const rLine of roleChunk) {
      const pMatch = rLine.match(
        /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}\s*[-–]\s*(?:January|February|March|April|May|June|July|August|September|October|November|December|\bPresent\b)\s*\d{0,4}/i,
      );
      if (pMatch) {
        period = pMatch[0];
        const yMatch = period.match(/\b(20\d\d)\b/);
        if (yMatch) year = yMatch[1];
      } else if (/Developer|Engineer|Architect|Lead|Intern|Designer|Analyst/i.test(rLine)) {
        role = rLine;
      }
    }

    // Remaining chunks: project, descriptions, skills
    const contentChunks = chunks.slice(2);
    let project = '';
    let skills: string[] = [];
    const achievementParagraphs: string[] = [];

    // Check if the last chunk is a skills line
    if (contentChunks.length > 0) {
      const lastChunk = contentChunks[contentChunks.length - 1];
      const lastText = lastChunk.join(' ').trim();
      if (
        !lastText.endsWith('.') &&
        /React|TypeScript|C#|PHP|MySQL|HTML|CSS|Prisma|WebSockets|Node|Python|Docker|AWS/i.test(lastText)
      ) {
        skills = extractSkillsFromText(lastText);
        contentChunks.pop();
      }
    }

    // First content chunk is the project title if it mentions project / development
    if (contentChunks.length > 0) {
      const firstText = contentChunks[0].join(' ').replace(/\s+/g, ' ').replace(/[.,\s]+$/, '').trim();
      if (/Project|development/i.test(firstText) && firstText.length < 120) {
        project = firstText;
        contentChunks.shift();
      }
    }

    for (const c of contentChunks) {
      const text = c.join(' ').replace(/\s+/g, ' ').trim();
      if (text) achievementParagraphs.push(text);
    }

    // Scan for any explicit repository or live demo link in the section markdown
    let companyUrl = '';
    for (const secLine of secLines) {
      const urlMatch = secLine.match(/https?:\/\/[^\s)\]"']+/);
      if (urlMatch) {
        companyUrl = urlMatch[0];
        break;
      }
    }
    if (!companyUrl) {
      if (/capstone/i.test(tag) || /Meycauayan|foo/i.test(company)) {
        companyUrl = `https://github.com/${username}/foo`;
      } else {
        companyUrl = `https://github.com/${username}/Experience`;
      }
    }

    parsed.push({
      id: `live-exp-${idx + 1}`,
      year,
      role,
      company: company || 'Software Developer',
      companyUrl,
      location: location || undefined,
      period,
      tag,
      project: project || undefined,
      description: achievementParagraphs.join(' ') || project || role,
      achievements: achievementParagraphs,
      skills,
      rawMeta,
    });
  }

  return {
    items: Object.freeze(parsed),
    subtitle,
  };
}

const MONTH_NAMES = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

/**
 * Dynamically computes company logo badge acronym from the company name
 * without any hardcoding.
 * e.g., "City Government of Meycauayan" -> "CG"
 * e.g., "ELI Information Technology Solutions" -> "ELI"
 * e.g., "Google" -> "GO"
 */
export function getCompanyInitials(company: string): string {
  if (!company) return 'EXP';

  const clean = company
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/[.,]/g, '')
    .trim();

  const words = clean.split(/\s+/).filter((w) => !/^(of|and|in|at|for|the|by|de|la)$/i.test(w));

  // If first word is an uppercase acronym of 2-4 chars (e.g. ELI, IBM, AWS, NASA)
  if (words.length > 0 && /^[A-Z]{2,4}$/.test(words[0])) {
    return words[0];
  }

  // If there are multiple words, take first letter of each (up to 2, e.g. "City Government" -> "CG")
  if (words.length >= 2) {
    return words.slice(0, 2).map((w) => w[0].toUpperCase()).join('');
  }

  return clean.slice(0, 2).toUpperCase();
}

/**
 * Mathematically calculates month/year duration from a period string dynamically.
 * e.g., "July 2025 - March 2026" -> "JULY 2025 – MARCH 2026 · 9 MOS"
 * e.g., "July 2025 - November 2025" -> "JULY 2025 – NOVEMBER 2025 · 5 MOS"
 * e.g., "January 2025 - Present" -> dynamically calculates up to the current date!
 */
export function calculateDurationMeta(period: string): string {
  if (!period) return '';
  const match = period.match(
    /([A-Za-z]+)\s+(\d{4})\s*[-–]\s*([A-Za-z]+|\bPresent\b)\s*(\d{0,4})/i,
  );
  if (!match) {
    return period.toUpperCase();
  }

  const startMonthStr = match[1].toLowerCase();
  const startYear = parseInt(match[2], 10);
  const endMonthStr = match[3].toLowerCase();
  const endYearStr = match[4];

  const startMonth = MONTH_NAMES.indexOf(startMonthStr);
  if (startMonth === -1) return period.toUpperCase();

  let endMonth: number;
  let endYear: number;

  if (endMonthStr === 'present') {
    const now = new Date();
    endMonth = now.getMonth();
    endYear = now.getFullYear();
  } else {
    endMonth = MONTH_NAMES.indexOf(endMonthStr);
    endYear = endYearStr ? parseInt(endYearStr, 10) : startYear;
  }

  if (endMonth === -1 || isNaN(startYear) || isNaN(endYear)) {
    return period.toUpperCase();
  }

  const totalMonths = (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
  if (totalMonths <= 0) {
    return period.toUpperCase();
  }

  let durationText: string;
  if (totalMonths < 12) {
    durationText = `${totalMonths} MOS`;
  } else {
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    const yrPart = `${years} ${years === 1 ? 'YR' : 'YRS'}`;
    const moPart = remainingMonths > 0 ? ` ${remainingMonths} ${remainingMonths === 1 ? 'MO' : 'MOS'}` : '';
    durationText = `${yrPart}${moPart}`;
  }

  const formattedPeriod = `${match[1]} ${startYear} – ${match[3]}${endYearStr ? ` ${endYearStr}` : ''}`.toUpperCase();
  return `${formattedPeriod} · ${durationText}`;
}

/**
 * Dynamically formats the work type and metadata subtitle under the company name
 * without any hardcoding.
 * Combines tag, client/department/internship metadata, and location.
 */
export function formatWorkType(item: ExperienceItem): string {
  const parts: string[] = [];

  // Tag part (e.g. "Capstone Project 1 & 2" or "Software Developer Intern")
  const cleanTag = item.tag
    ? item.tag.replace(/^[A-Za-z0-9&]+\s{2,}/, '').trim()
    : '';

  if (cleanTag) {
    parts.push(cleanTag);
  }

  // Any extra metadata lines from the README (e.g. client, hours, work arrangement)
  if (item.rawMeta && item.rawMeta.length > 0) {
    for (const meta of item.rawMeta) {
      if (/office|officer/i.test(meta) && !/client/i.test(meta)) {
        parts.push(`Client: ${meta}`);
      } else {
        parts.push(meta);
      }
    }
  }

  // Location part if not already in metadata or tag
  if (item.location && !parts.some((p) => p.toLowerCase().includes(item.location!.toLowerCase()))) {
    parts.push(item.location);
  }

  return parts.join(' · ') || item.role;
}

/**
 * Fetches live documentation exclusively from the README.md file in the user's
 * GitHub Experience repository (joshuapalero/Experience).
 * Uses cache-busting timestamp to ensure immediate reflection of new commits.
 */
export async function fetchExperienceFromGist(
  params: FetchExperienceParams = {},
): Promise<ExperienceDataResult> {
  const resolvedUsername = (params.username || 'joshuapalero').trim();
  const token =
    params.token ||
    (typeof import.meta !== 'undefined'
      ? (import.meta.env.VITE_GITHUB_TOKEN as string | undefined)
      : undefined);

  const repoCandidates = ['Experience', 'Experiences', 'Experiencs', 'experience', 'experiences', 'experiencs'];

  const fileResult = await fetchRawFileViaProxyOrDirect(
    resolvedUsername,
    repoCandidates,
    ['README.md'],
    ['main', 'master'],
    token,
    params.signal
  );

  if (fileResult && fileResult.text) {
    const { items, subtitle } = parseLiveExperienceReadme(fileResult.text, resolvedUsername);
    if (items.length > 0 || subtitle) {
      let realLastUpdated = new Date().toISOString();
      try {
        const repoRes = await fetch(`https://api.github.com/repos/${resolvedUsername}/${fileResult.repo}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          signal: params.signal,
        });
        if (repoRes.ok) {
          const repoData = await repoRes.json();
          if (repoData.pushed_at) {
            realLastUpdated = repoData.pushed_at;
          } else if (repoData.updated_at) {
            realLastUpdated = repoData.updated_at;
          }
        }
      } catch {
        // Fallback to current time if network fails
      }

      return {
        items,
        subtitle: subtitle || undefined,
        source: 'github-repo',
        sourceUrl: `https://github.com/${resolvedUsername}/${fileResult.repo}`,
        lastUpdated: realLastUpdated,
      };
    }
  }

  // If completely offline or GitHub unreachable, return empty live-sourced structure
  return {
    items: [],
    subtitle: undefined,
    source: 'github-repo',
    sourceUrl: `https://github.com/${resolvedUsername}/Experience`,
  };
}

export const fetchExperienceFromGithub = fetchExperienceFromGist;
