import React, { useMemo, type ReactNode } from 'react';
import { useBio } from './queries';
import { Skeleton, SkeletonGroup, Spinner } from '../ui';
import type { BioProps } from './types';
import './bio.css';

/**
 * Aurora Scharff Co-located Zero-CLS Bio Skeleton Component.
 * Mirrors the exact multiline paragraph layout and line heights of the bio from GitHub.
 */
export function BioSkeleton() {
  return (
    <SkeletonGroup label="Loading biography from GitHub..." className="bio bio-skeleton-group">
      <div className="bio-skeleton-paragraph" aria-hidden="true">
        <Skeleton variant="text" width="100%" height={15} />
        <Skeleton variant="text" width="92%" height={15} />
        <Skeleton variant="text" width="78%" height={15} />
      </div>
      <div className="bio-skeleton-paragraph" aria-hidden="true" style={{ marginTop: '0.65rem' }}>
        <Skeleton variant="text" width="96%" height={15} />
        <Skeleton variant="text" width="84%" height={15} />
      </div>
      <div className="bio-skeleton-paragraph" aria-hidden="true" style={{ marginTop: '0.65rem' }}>
        <Skeleton variant="text" width="65%" height={15} />
      </div>
    </SkeletonGroup>
  );
}

/**
 * Safely parses inline markdown bold (**bold** or __bold__) and strong tags
 * into React strong elements, preserving exact styling without XSS risk.
 */
function formatBioLine(text: string, keyPrefix = 'bio'): ReactNode[] {
  let processed = text;

  // Normalize <strong>...</strong> to **...**
  processed = processed.replace(/<strong>(.*?)<\/strong>/gi, '**$1**');

  // If no explicit bold tags are provided, highlight primary professional keywords
  if (!/\*\*|__/.test(processed)) {
    processed = processed
      .replace(/\bSoftware (Developer|Engineer)\b/g, '**$&**')
      .replace(/\bManila,?\s*Philippines\b/gi, '**$&**');
  }

  // Regex to match **bold** or __bold__
  const parts = processed.split(/(\*\*.*?\*\*|__.*?__)/g);

  return parts.map((part, idx) => {
    if (
      (part.startsWith('**') && part.endsWith('**')) ||
      (part.startsWith('__') && part.endsWith('__'))
    ) {
      const inner = part.slice(2, -2);
      return <strong key={`${keyPrefix}-strong-${idx}`}>{inner}</strong>;
    }
    return part;
  });
}

/**
 * Renders a single markdown paragraph, respecting:
 * 1. Explicit <br> or <br/> tags
 * 2. Markdown hard line breaks (lines ending with 2+ spaces or a backslash '\')
 * 3. Standard Markdown soft line breaks (single newlines), which are joined with a space
 *    so sentences flow naturally into a single cohesive paragraph.
 */
function renderParagraphContent(paragraphText: string, pIdx: number): ReactNode[] {
  // First split by explicit HTML <br> or <br/> tags
  const brSegments = paragraphText.split(/<br\s*\/?>/gi);
  const elements: ReactNode[] = [];

  brSegments.forEach((segment, sIdx) => {
    if (sIdx > 0) {
      elements.push(<br key={`p${pIdx}-br-tag-${sIdx}`} />);
    }

    const lines = segment.split(/\r?\n/);

    lines.forEach((rawLine, lIdx) => {
      // Check for markdown hard break before trimming: 2+ trailing spaces or trailing backslash
      const hasHardBreak = /( {2,}|\\)$/.test(rawLine);
      const cleanLine = rawLine.replace(/( {2,}|\\)$/, '').trim();

      if (!cleanLine) return;

      if (elements.length > 0) {
        const lastEl = elements[elements.length - 1];
        const isLastBr = React.isValidElement(lastEl) && lastEl.type === 'br';
        if (!isLastBr) {
          elements.push(' ');
        }
      }

      elements.push(...formatBioLine(cleanLine, `p${pIdx}-s${sIdx}-l${lIdx}`));

      if (hasHardBreak && lIdx < lines.length - 1) {
        elements.push(<br key={`p${pIdx}-br-hard-${sIdx}-${lIdx}`} />);
      }
    });
  });

  return elements;
}

export default function Bio({
  username = 'joshuapalero',
  repo = 'About-me',
  token,
}: BioProps) {
  const { data, isPending, isFetching, isError } = useBio({ username, repo, token });

  const rawText = data?.rawText ?? '';

  const renderedParagraphs = useMemo(() => {
    if (!rawText.trim()) return [];

    // Split by double-newlines into distinct paragraphs
    const rawParagraphs = rawText.split(/\r?\n\s*\r?\n/).filter((p) => p.trim().length > 0);

    return rawParagraphs.map((paragraph, pIdx) => {
      return (
        <p key={pIdx}>
          {renderParagraphContent(paragraph, pIdx)}
        </p>
      );
    });
  }, [rawText]);

  if (isPending) {
    return <BioSkeleton />;
  }

  if (isError || renderedParagraphs.length === 0) {
    return (
      <div className="bio bio-empty">
        <p>Empty</p>
      </div>
    );
  }

  return (
    <div className="bio" aria-label="About me bio">
      {renderedParagraphs}
      {isFetching && !isPending && (
        <span className="bio-sync-indicator" title="Syncing bio live from GitHub...">
          <Spinner size="sm" label="Syncing..." />
        </span>
      )}
    </div>
  );
}
