import { fetchRawFileViaProxyOrDirect } from '../github_proxy';
import {
  GIT_PRACTICE_ACTIVITY,
} from './practiceData';
import type {
  PracticeActivityDataResult,
  PracticeActivityItem,
  PracticeCommandExample,
  PracticeSection,
} from './types';

export interface FetchPracticeActivityParams {
  username?: string;
  token?: string;
  signal?: AbortSignal;
}

/**
 * Parses markdown from GitHub repository into structured practice activity sections.
 * Supports headings (`#`, `##`, `###`), code blocks (```bash), blockquotes, and bullet lists.
 */
export function parsePracticeActivityMarkdown(
  markdown: string,
  _username: string,
  _repo: string,
  lastUpdatedDate?: string,
): readonly PracticeActivityItem[] {
  const text = markdown.trim();
  if (!text) return [];

  const lines = text.split(/\r?\n/);
  const sections: PracticeSection[] = [];
  const introParagraphLines: string[] = [];
  let currentSection: {
    title: string;
    description: string;
    examples: PracticeCommandExample[];
  } | null = null;

  let currentExample: {
    title: string;
    commandLines: string[];
    descriptionLines: string[];
    inCodeBlock: boolean;
  } | null = null;

  let sectionCounter = 1;
  let exampleCounter = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Markdown Section Header (e.g. ## 01 - Staging & Commits or ## Branching)
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      // Flush previous example
      if (currentExample && currentSection) {
        currentSection.examples.push({
          id: `dyn-ex-${exampleCounter++}`,
          title: currentExample.title,
          command: currentExample.commandLines.join('\n').trim(),
          description: currentExample.descriptionLines.join('\n').trim() || 'Command example from repository.',
          category: currentSection.title,
        });
        currentExample = null;
      }

      // Flush previous section
      if (currentSection && currentSection.examples.length > 0) {
        sections.push({
          id: `sec-dyn-${sectionCounter}`,
          sectionNumber: String(sectionCounter).padStart(2, '0'),
          title: currentSection.title,
          description: currentSection.description || 'Practice commands and documentation.',
          examples: currentSection.examples,
        });
        sectionCounter++;
      }

      const secTitle = trimmed.replace(/^##\s+/, '').replace(/^\d+[\s\-—:]+/, '').trim();
      currentSection = {
        title: secTitle,
        description: '',
        examples: [],
      };
      continue;
    }

    // Command Header (### Command Title)
    if (trimmed.startsWith('### ') && currentSection) {
      if (currentExample) {
        currentSection.examples.push({
          id: `dyn-ex-${exampleCounter++}`,
          title: currentExample.title,
          command: currentExample.commandLines.join('\n').trim(),
          description: currentExample.descriptionLines.join('\n').trim() || 'Command example from repository.',
          category: currentSection.title,
        });
      }

      const exTitle = trimmed.replace(/^###\s+/, '').trim();
      currentExample = {
        title: exTitle,
        commandLines: [],
        descriptionLines: [],
        inCodeBlock: false,
      };
      continue;
    }

    // Code block toggle (```bash / ```sh / ```)
    if (trimmed.startsWith('```')) {
      if (currentExample) {
        currentExample.inCodeBlock = !currentExample.inCodeBlock;
      }
      continue;
    }

    // Inside code block -> accumulate command line
    if (currentExample?.inCodeBlock) {
      currentExample.commandLines.push(line);
      continue;
    }

    // Outside code block -> accumulate description
    if (currentExample && trimmed) {
      currentExample.descriptionLines.push(trimmed);
      continue;
    }

    // Section description
    if (currentSection && !currentExample && trimmed && !trimmed.startsWith('#')) {
      if (!currentSection.description) {
        currentSection.description = trimmed;
      } else {
        currentSection.description += ` ${trimmed}`;
      }
      continue;
    }

    // Intro paragraph before any section header (##)
    if (!currentSection && trimmed && !trimmed.startsWith('#')) {
      introParagraphLines.push(trimmed);
      continue;
    }
  }

  // Flush remaining example
  if (currentExample && currentSection) {
    currentSection.examples.push({
      id: `dyn-ex-${exampleCounter}`,
      title: currentExample.title,
      command: currentExample.commandLines.join('\n').trim(),
      description: currentExample.descriptionLines.join('\n').trim() || 'Command example from repository.',
      category: currentSection.title,
    });
  }

  // Flush remaining section
  if (currentSection && currentSection.examples.length > 0) {
    sections.push({
      id: `sec-dyn-${sectionCounter}`,
      sectionNumber: String(sectionCounter).padStart(2, '0'),
      title: currentSection.title,
      description: currentSection.description || 'Practice commands and documentation.',
      examples: currentSection.examples,
    });
  }

  const dynamicIntro = introParagraphLines.join(' ').trim();
  const dynamicExcerpt = sections[0]?.description || dynamicIntro || '';
  const dynamicSummary = sections[0]?.description || dynamicIntro || '';

  // If parsed sections contain valid examples, return dynamic item
  if (sections.length > 0) {
    const combinedSections = sections;

    const totalCommands = combinedSections.reduce(
      (acc, s) => acc + s.examples.length,
      0,
    );

    const dynamicGitItem: PracticeActivityItem = {
      ...GIT_PRACTICE_ACTIVITY,
      title: 'Learn Git with me',
      totalCommands,
      sections: combinedSections,
      excerpt: dynamicExcerpt,
      summary: dynamicSummary,
      lastUpdated:
        (lastUpdatedDate ? lastUpdatedDate.split('T')[0] : '') ||
        new Date().toISOString().split('T')[0],
    };

    return [dynamicGitItem];
  }

  return [];
}

/**
 * Fetches practice activity dynamic data from GitHub repository or falls back
 * gracefully to authoritative built-in curriculum without downtime.
 */
export async function fetchPracticeActivityFromGithub(
  params: FetchPracticeActivityParams = {},
): Promise<PracticeActivityDataResult> {
  const resolvedUsername = (
    params.username ||
    (typeof import.meta !== 'undefined' ? import.meta.env.VITE_GITHUB_USERNAME : undefined) ||
    'joshuapalero'
  ).trim();

  const token =
    params.token ||
    (typeof import.meta !== 'undefined'
      ? (import.meta.env.VITE_GITHUB_TOKEN as string | undefined)
      : undefined);

  // Supported repository name candidates
  const repoCandidates = [
    'Practice-Activity-Repo',
    'practice-activity-repo',
    'Practice-Activity',
    'practice-activity',
    'Practice_Activity_Repo',
    'Practice_Activity',
  ];

  const filePaths = ['README.md', 'topics/git.md', 'git.md'];

  try {
    const fileResult = await fetchRawFileViaProxyOrDirect(
      resolvedUsername,
      repoCandidates,
      filePaths,
      ['main', 'master'],
      token,
      params.signal,
    );

    if (fileResult && fileResult.text && fileResult.text.trim().length > 0) {
      let repoDate: string | undefined;
      try {
        const apiHeaders: Record<string, string> = {
          Accept: 'application/vnd.github.v3+json',
        };
        if (token) {
          apiHeaders.Authorization = `Bearer ${token}`;
        }
        const repoMetaRes = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(resolvedUsername)}/${encodeURIComponent(fileResult.repo)}`,
          { headers: apiHeaders, signal: params.signal, cache: 'no-cache' },
        ).catch(() => null);

        if (repoMetaRes && repoMetaRes.ok) {
          const repoData = await repoMetaRes.json();
          if (repoData?.pushed_at) {
            repoDate = repoData.pushed_at;
          } else if (repoData?.updated_at) {
            repoDate = repoData.updated_at;
          }
        }
      } catch {
        // Fall back gracefully if GitHub API is unreachable or rate limited
      }

      const items = parsePracticeActivityMarkdown(
        fileResult.text,
        resolvedUsername,
        fileResult.repo,
        repoDate,
      );

      const subtitleMatch = fileResult.text.match(/\(subtitle\):\s*"([^"]+)"/i);
      const subtitle = subtitleMatch ? subtitleMatch[1].trim() : undefined;

      return {
        items,
        source: 'github-repo',
        sourceUrl: `https://github.com/${resolvedUsername}/${fileResult.repo}`,
        lastUpdated:
          (repoDate ? repoDate.split('T')[0] : '') ||
          new Date().toISOString().split('T')[0],
        rawMarkdown: fileResult.text,
        subtitle,
      };
    }
  } catch (err) {
    if (params.signal?.aborted) {
      throw err;
    }
    console.warn('[Practice Activity] GitHub live fetch unreached, using authoritative local curriculum:', err);
  }

  // No fallback, only return GitHub data (or empty if failed)
  return {
    items: [],
    source: 'github-repo',
    sourceUrl: `https://github.com/${resolvedUsername}/Practice-Activity-Repo`,
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}
