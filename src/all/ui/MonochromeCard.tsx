import React, { memo } from 'react';

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  icon?: React.ReactNode;
}

export interface MonochromeCardProps extends React.HTMLAttributes<HTMLElement> {
  category?: string;
  title: string;
  description?: string;
  shortcut?: string;
  primaryAction?: ActionButtonProps;
  secondaryAction?: ActionButtonProps;
  ghostAction?: ActionButtonProps;
  children?: React.ReactNode;
}

/**
 * High-performance, zero-layout-thrashing Monochromatic Card Component.
 * - Optimized for 60/120fps GPU compositor rendering.
 * - Zero JS interaction state overhead (pure CSS hardware accelerated transitions).
 * - Implements distinct Light Mode (tactile white-on-white) and Dark Mode (translucent inset) button ergonomics.
 */
export const MonochromeCard = memo(function MonochromeCard({
  category,
  title,
  description,
  shortcut,
  primaryAction,
  secondaryAction,
  ghostAction,
  children,
  className = '',
  ...rest
}: MonochromeCardProps) {
  return (
    <article
      className={`monochrome-card ${className}`.trim()}
      {...rest}
    >
      {/* Eyebrow Header */}
      {(category || shortcut) && (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          {category && (
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'var(--text-muted)',
              }}
            >
              {category}
            </span>
          )}
          {shortcut && (
            <kbd
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.7rem',
                fontWeight: 500,
                padding: '2px 6px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--badge-bg)',
                color: 'var(--text-muted)',
              }}
            >
              {shortcut}
            </kbd>
          )}
        </header>
      )}

      {/* Title & Body */}
      <div style={{ marginBottom: children ? '16px' : '20px' }}>
        <h3
          style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            lineHeight: 1.3,
            letterSpacing: '-0.02em',
            color: 'var(--text-primary)',
            margin: '0 0 6px 0',
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              fontSize: '0.875rem',
              lineHeight: 1.5,
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Custom Body / Slot */}
      {children}

      {/* Action Footer */}
      {(primaryAction || secondaryAction || ghostAction) && (
        <footer
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
            flexWrap: 'wrap',
          }}
        >
          {/* Ghost / Low-Emphasis Action */}
          <div>
            {ghostAction && (
              <button
                type="button"
                className="btn-ghost"
                {...ghostAction}
              >
                {ghostAction.icon}
                {ghostAction.label}
              </button>
            )}
          </div>

          {/* High & Medium Emphasis Actions */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            {secondaryAction && (
              <button
                type="button"
                className="btn-secondary"
                {...secondaryAction}
              >
                {secondaryAction.icon}
                {secondaryAction.label}
              </button>
            )}

            {primaryAction && (
              <button
                type="button"
                className="btn-primary"
                {...primaryAction}
              >
                {primaryAction.icon}
                {primaryAction.label}
              </button>
            )}
          </div>
        </footer>
      )}
    </article>
  );
});
