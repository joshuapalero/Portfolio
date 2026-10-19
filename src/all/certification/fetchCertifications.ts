import type { CertificationDataResult, CertificationItem } from './types';
import { fetchRawFileViaProxyOrDirect } from '../github_proxy';

export interface FetchCertificationParams {
  username?: string;
  token?: string;
  signal?: AbortSignal;
}

/**
 * Dynamically parses certifications exclusively from the README.md file in the user's
 * GitHub Certifications repository (no hardcoded data).
 * Supports markdown lists, headings, and pipe-delimited records.
 */
export function parseLiveCertificationsReadme(
  markdown: string,
  username: string,
  repo: string,
): { readonly items: readonly CertificationItem[]; readonly subtitle: string } {
  const text = markdown.trim();
  const lines = text.split(/\r?\n/);
  const items: CertificationItem[] = [];

  // Capture subtitle: any plain-text prose between the top heading and the first cert entry
  const subtitleLines: string[] = [];
  const contentLines: string[] = [];
  let pastHeader = false;
  let sectionStarted = false;

  for (const l of lines) {
    const trimmed = l.trim();
    // Detect and skip the top-level repo header (e.g. # Certifications-)
    if (!pastHeader && /^#\s*Certifications/i.test(trimmed)) {
      pastHeader = true;
      continue;
    }
    if (!pastHeader) continue;

    // Once a bullet, link, or h2+ heading appears, content proper has started
    if (!sectionStarted && (/^\s*[-*+]\s+/.test(l) || /^#{2,4}\s+/.test(trimmed) || /^\[/.test(trimmed))) {
      sectionStarted = true;
    }

    // Collect plain prose lines as subtitle candidates (before section content starts)
    if (!sectionStarted && trimmed && !/^#{1,6}\s/.test(trimmed)) {
      subtitleLines.push(trimmed);
    }

    contentLines.push(l);
  }

  const subtitle = subtitleLines.join(' ').trim();

  // 1. Check for bullet list items: "- ...", "* ..."
  const bulletItems = contentLines.filter((l) => /^\s*[-*+]\s+/.test(l));
  if (bulletItems.length > 0) {
    for (let i = 0; i < bulletItems.length; i++) {
      const rawLine = bulletItems[i].replace(/^\s*[-*+]\s+/, '').trim();
      if (!rawLine) continue;

      let title = '';
      let issuer = 'Verified Issuer';
      let year = '2025';
      let issueDate = '2025';
      let credentialUrl = `https://github.com/${username}/${repo}`;
      let description = '';
      let skills: string[] = [];

      // Check markdown link [Title](url)
      const linkMatch = rawLine.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        title = linkMatch[1].trim();
        credentialUrl = linkMatch[2].trim();
      }

      // Check pipe or hyphen separation
      const segments = rawLine
        .replace(/\[([^\]]+)\]\([^)]+\)/, '$1')
        .split(/\||—| - /)
        .map((s) => s.replace(/\*\*/g, '').trim())
        .filter(Boolean);

      if (!title && segments.length > 0) {
        title = segments[0];
      }
      if (segments.length > 1) {
        issuer = segments[1];
      }
      if (segments.length > 2) {
        const dateMatch = segments[2].match(/\b(20\d\d)\b/);
        if (dateMatch) {
          year = dateMatch[1];
          issueDate = segments[2];
        } else {
          description = segments[2];
        }
      }
      if (segments.length > 3) {
        description = segments[3];
      }

      // Extract skills if specified
      const skillsMatch = rawLine.match(/(?:Skills|Technologies):\s*([^\n|]+)/i);
      if (skillsMatch) {
        skills = skillsMatch[1]
          .split(/,\s*|\s+/)
          .map((s) => s.trim())
          .filter(Boolean);
      }

      if (title) {
        items.push({
          id: `live-cert-${i + 1}`,
          year,
          title,
          issuer,
          issueDate,
          credentialUrl,
          description: description || `Certification record from ${repo}/README.md.`,
          skills,
          verified: true,
        });
      }
    }
  }

  // 2. Check for headings: "## Title" or "### Title"
  if (items.length === 0) {
    const sections = text.split(/(?=^#{2,4}\s+)/m);
    for (let i = 0; i < sections.length; i++) {
      const sec = sections[i].trim();
      if (!sec || /^#\s*Certifications/i.test(sec)) continue;

      const headerMatch = sec.match(/^#{2,4}\s+(.+)$/m);
      if (!headerMatch) continue;

      const headerText = headerMatch[1].trim();
      const linkMatch = headerText.match(/\[([^\]]+)\]\(([^)]+)\)/);
      const title = linkMatch ? linkMatch[1].trim() : headerText.replace(/\*\*/g, '').trim();
      const credentialUrl = linkMatch ? linkMatch[2].trim() : `https://github.com/${username}/${repo}`;

      const issuerMatch = sec.match(/(?:Issuer|Platform|Organization):\s*([^\r\n,.]+)/i);
      const yearMatch = sec.match(/\b(20\d\d)\b/);
      const skillsMatch = sec.match(/(?:Skills|Tech):\s*([^\r\n.]+)/i);

      const descLines = sec
        .split(/\r?\n/)
        .filter(
          (l) =>
            !l.startsWith('#') &&
            !/^(?:Issuer|Platform|Organization|Skills|Tech):/i.test(l.trim()) &&
            l.trim(),
        );
      const description = descLines.join(' ').trim();

      items.push({
        id: `live-cert-${items.length + 1}`,
        year: yearMatch ? yearMatch[1] : '2025',
        title,
        issuer: issuerMatch ? issuerMatch[1].trim() : 'Verified Institution',
        issueDate: yearMatch ? yearMatch[1] : '2025',
        credentialUrl,
        description: description || `Certification entry from ${repo}/README.md.`,
        skills: skillsMatch
          ? skillsMatch[1]
              .split(/,\s*/)
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        verified: true,
      });
    }
  }

  return { items: Object.freeze(items), subtitle };
}

/**
 * Dynamically parses certifications from JSON formatted data (e.g. certifications.json or public data asset).
 */
export function parseLiveCertificationsJson(
  rawText: string,
  resolvedUsername = 'joshuapalero',
  repoName = 'Certifications-',
): readonly CertificationItem[] {
  try {
    const parsed = JSON.parse(rawText);
    const dataArray = Array.isArray(parsed) ? parsed : (parsed.certifications || parsed.items || []);

    if (Array.isArray(dataArray) && dataArray.length > 0) {
      interface RawCert {
        id?: string;
        year?: string;
        issueDate?: string;
        expiryDate?: string;
        title?: string;
        issuer?: string;
        organization?: string;
        credentialUrl?: string;
        url?: string;
        credentialId?: string;
        badge?: string;
        description?: string;
        skills?: string | string[];
        verified?: boolean;
      }

      return Object.freeze(
        dataArray.map((cert: RawCert, idx: number) => {
          const issueDate = cert.issueDate || cert.year || '2025';
          const year = cert.year || issueDate.substring(0, 4) || '2025';
          const skills = Array.isArray(cert.skills)
            ? cert.skills
            : cert.skills
              ? String(cert.skills)
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [];

          return {
            id: cert.id || `live-cert-${idx + 1}`,
            year,
            title: cert.title || 'Certification',
            issuer: cert.issuer || cert.organization || 'Verified Institution',
            issueDate,
            expiryDate: cert.expiryDate || undefined,
            credentialUrl:
              cert.credentialUrl || cert.url || `https://github.com/${resolvedUsername}/${repoName}`,
            credentialId: cert.credentialId || cert.id || undefined,
            badge: cert.badge || undefined,
            description: cert.description || `Certification entry from ${repoName}`,
            skills,
            verified: cert.verified !== undefined ? Boolean(cert.verified) : true,
          };
        }),
      );
    }
  } catch {
    // Fallback if JSON parsing fails
  }
  return Object.freeze([]);
}

/**
 * Fetches certifications exclusively from the user's GitHub repository README.md/JSON.
 * Adheres to strict requirement: No hardcoded certificate data; data is read exclusively from the GitHub repository.
 */
export async function fetchCertificationsFromGithub(
  params: FetchCertificationParams = {},
): Promise<CertificationDataResult> {
  const resolvedUsername = (params.username || 'joshuapalero').trim();
  const token =
    params.token ||
    (typeof import.meta !== 'undefined'
      ? (import.meta.env.VITE_GITHUB_TOKEN as string | undefined)
      : undefined);

  const repoCandidates = ['Certifications-', 'Certifications', 'certification', 'certifications'];

  // Live GitHub repository search
  const fileResult = await fetchRawFileViaProxyOrDirect(
    resolvedUsername,
    repoCandidates,
    ['README.md', 'certifications.json', 'certs.json', 'README.mdx'],
    ['main', 'master'],
    token,
    params.signal,
  );

  if (fileResult && fileResult.text) {
    const rawText = fileResult.text.trim();
    let items: readonly CertificationItem[] = [];
    let subtitle = '';

    if (rawText.startsWith('{') || rawText.startsWith('[')) {
      items = parseLiveCertificationsJson(rawText, resolvedUsername, fileResult.repo);
    }

    if (items.length === 0) {
      const parsed = parseLiveCertificationsReadme(fileResult.text, resolvedUsername, fileResult.repo);
      items = parsed.items;
      subtitle = parsed.subtitle;
    }

    if (items.length > 0) {
      return {
        items,
        subtitle: subtitle || undefined,
        source: 'github-repo',
        sourceUrl: `https://github.com/${resolvedUsername}/${fileResult.repo}`,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  // If repository is empty or unreachable, return empty live-sourced structure (strictly no hardcoded data)
  return {
    items: [],
    subtitle: undefined,
    source: 'github-repo',
    sourceUrl: `https://github.com/${resolvedUsername}/Certifications-`,
  };
}

/**
 * Resolves high-contrast monogram or acronym for certification issuers and titles
 * to display in the vertical timeline logo box.
 */
export function getInitials(issuer: string, title = ''): string {
  if (/amazon|aws/i.test(issuer) || /\baws\b/i.test(title)) return 'AWS';
  if (/meta|facebook/i.test(issuer)) return 'META';
  if (/google/i.test(issuer) || /\bgcp\b/i.test(title)) return 'GCP';
  if (/comptia/i.test(issuer)) return 'SEC+';
  if (/harvard|cs50/i.test(issuer) || /\bcs50\b/i.test(title)) return 'CS50';
  if (/freecodecamp/i.test(issuer)) return 'FCC';
  if (/microsoft/i.test(issuer) || /\bazure\b/i.test(title)) return 'MS';
  if (/hackerrank/i.test(issuer)) return 'HR';
  if (/city government/i.test(issuer) || /capstone/i.test(title)) return 'CG';
  const clean = issuer.replace(/[^A-Za-z0-9]/g, ' ').trim().split(/\s+/);
  if (clean.length >= 2) {
    return (clean[0][0] + clean[1][0]).toUpperCase();
  }
  return issuer.slice(0, 3).toUpperCase() || 'CRT';
}
