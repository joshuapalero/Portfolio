import { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  GitBranch,
  Terminal,
  Container,
  AlertTriangle,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import { HistoryFooter } from '../ui';
import { formatPracticeDate } from './formatDate';
import type { PracticeActivityItem, PracticeCommandExample } from './types';
import './practice_activity.css';

export interface PracticeDetailProps {
  readonly item: PracticeActivityItem;
  readonly onBack?: () => void;
  readonly sourceUrl?: string;
}

function resolveTopicIcon(iconName: string) {
  switch (iconName.toLowerCase()) {
    case 'gitbranch':
    case 'git':
      return <GitBranch size={28} />;
    case 'container':
    case 'docker':
      return <Container size={28} />;
    case 'terminal':
    case 'cli':
    case 'shell':
    default:
      return <Terminal size={28} />;
  }
}

/**
 * Interactive Terminal Box with 1-Click Copy to Clipboard.
 */
function TerminalCommandBox({ command }: { readonly command: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  return (
    <div className="practice-terminal-box">
      <button
        type="button"
        className={`practice-copy-btn ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
        aria-label="Copy command to clipboard"
        title="Copy command"
      >
        {copied ? (
          <>
            <Check size={12} />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy size={12} />
            <span>Copy</span>
          </>
        )}
      </button>

      <code className="practice-terminal-code">{command}</code>
    </div>
  );
}

/**
 * Single Command Example Item Component.
 */
function CommandExampleCard({ example }: { readonly example: PracticeCommandExample }) {
  return (
    <article className="practice-example-item" id={example.id}>
      <header className="practice-example-top">
        <div className="practice-example-title-wrap">
          <h4 className="practice-example-title">{example.title}</h4>
          {example.isBestPractice && (
            <span className="practice-example-best-badge">
              <Sparkles size={11} />
              <span>Best Practice</span>
            </span>
          )}
        </div>

        <span className="practice-badge">{example.category}</span>
      </header>

      {example.whenToUse && (
        <p className="practice-example-when">
          <strong>When to use:</strong> {example.whenToUse}
        </p>
      )}

      <p className="practice-example-desc">{example.description}</p>

      {/* Terminal Code Execution Box */}
      <TerminalCommandBox command={example.command} />

      {/* Flags Breakdown */}
      {example.flagsExplained && example.flagsExplained.length > 0 && (
        <div className="practice-flags-wrap">
          {example.flagsExplained.map((f, i) => (
            <div key={i} className="practice-flag-row">
              <span className="practice-flag-code">{f.flag}</span>
              <span className="practice-flag-text">{f.explanation}</span>
            </div>
          ))}
        </div>
      )}

      {/* Output preview */}
      {example.outputExample && (
        <div className="practice-output-box" aria-label="Terminal output example">
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem', marginBottom: 2 }}>Sample Output:</div>
          {example.outputExample}
        </div>
      )}

      {/* Warning or Tip */}
      {example.warningOrTip && (
        <div className="practice-warning-box">
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <span>{example.warningOrTip}</span>
        </div>
      )}
    </article>
  );
}

export function PracticeDetail({ item, onBack }: PracticeDetailProps) {
  const formattedUpdatedDate = formatPracticeDate(item.lastUpdated);

  return (
    <div className="practice-detail-container">
      {onBack && (
        <button
          type="button"
          className="practice-back-btn"
          onClick={onBack}
          aria-label="Back to practice activities"
        >
          <ArrowLeft size={16} />
          <span>Back to Github Activity</span>
        </button>
      )}

      <header className="practice-detail-header">
        {formattedUpdatedDate && (
          <div className="practice-detail-badges-row" style={{ justifyContent: 'flex-end' }}>
            <span className="practice-badge">Updated: {formattedUpdatedDate}</span>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <div className="practice-card-icon-box" style={{ width: 48, height: 48 }}>
            {resolveTopicIcon(item.iconName)}
          </div>
          <h1 className="practice-detail-title" style={{ margin: 0 }}>
            {item.title}
          </h1>
        </div>

        </header>

      {/* List of Practical Command Examples */}
      {item.sections.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: 'var(--text-secondary, #a1a1aa)',
            background: 'var(--bg-card, rgba(255,255,255,0.03))',
            borderRadius: 8,
            border: '1px solid var(--border-color, rgba(255,255,255,0.1))',
          }}
        >
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            No commands found in this activity.
          </p>
        </div>
      ) : (
        <div className="practice-sections-list">
          {item.sections.map((sec) => (
            <section key={sec.id} className="practice-section-block">
              <header className="practice-section-header">
                <span className="practice-section-num">{sec.sectionNumber} —</span>
                <h3 className="practice-section-title">{sec.title}</h3>
              </header>

              <p className="practice-section-desc">{sec.description}</p>

              {/* Best Practices Box if section has notes */}
              {sec.bestPracticesNotes && sec.bestPracticesNotes.length > 0 && (
                <div className="practice-best-practices-box">
                  <div className="practice-best-practices-heading">
                    <Lightbulb size={14} />
                    <span>Industry Best Practices</span>
                  </div>
                  <ul className="practice-best-practices-list">
                    {sec.bestPracticesNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Commands List */}
              <div className="practice-examples-list" role="list">
                {sec.examples.map((example) => (
                  <CommandExampleCard key={example.id} example={example} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <HistoryFooter 
        externalUrl="/resources" 
        externalText={`Learn ${item.title} with me`} 
      />
    </div>
  );
}

export default PracticeDetail;
