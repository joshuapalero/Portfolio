import type { HTMLAttributes } from 'react';
import './ui.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export type SpinnerProps = {
  size?: SpinnerSize;
  label?: string;
  className?: string;
  ringClassName?: string;
} & HTMLAttributes<HTMLSpanElement>;

/**
 * Accessible micro-spinner for user actions, inline badges, and buttons.
 * Complies with WCAG 2.2 status announcement standards.
 */
export function Spinner({
  size = 'md',
  label = 'Loading...',
  className = '',
  ringClassName = '',
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      className={`ui-spinner-container ui-spinner--${size} ${className}`.trim()}
      {...props}
    >
      <span aria-hidden="true" className={`ui-spinner-ring ${ringClassName}`.trim()} />
      <span className="sr-only">{label}</span>
    </span>
  );
}
