import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import './ui.css';

export type SkeletonVariant = 'text' | 'circular' | 'rounded' | 'rectangular';
export type SkeletonAnimation = 'shimmer' | 'pulse' | 'none';

export type SkeletonProps<T extends ElementType = 'span'> = {
  as?: T;
  variant?: SkeletonVariant;
  animation?: SkeletonAnimation;
  width?: string | number;
  height?: string | number;
  className?: string;
} & ComponentPropsWithoutRef<T>;

/**
 * Accessible, zero-CLS polymorphic Skeleton placeholder primitive.
 * Designed following Aurora Scharff's loading UI guidelines & WCAG 2.2.
 */
export function Skeleton<T extends ElementType = 'span'>({
  as,
  variant = 'rounded',
  animation = 'shimmer',
  width,
  height,
  className = '',
  style,
  ...props
}: SkeletonProps<T>) {
  const Component = as ?? 'span';

  const variantClass = `ui-skeleton--${variant}`;
  const animClass = animation !== 'none' ? `ui-skeleton--${animation}` : '';

  const inlineStyles = {
    ...(width !== undefined && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height !== undefined && { height: typeof height === 'number' ? `${height}px` : height }),
    ...style,
  };

  return (
    <Component
      aria-hidden="true"
      tabIndex={-1}
      className={`ui-skeleton ${variantClass} ${animClass} ${className}`.trim()}
      style={inlineStyles}
      {...props}
    />
  );
}

export type SkeletonGroupProps = {
  children: ReactNode;
  label?: string;
  className?: string;
};

/**
 * Accessible wrapper for composite skeleton screens.
 * Provides the single necessary `role="status"` and `aria-busy="true"`
 * with an off-screen accessible description for screen readers.
 */
export function SkeletonGroup({
  children,
  label = 'Loading content, please wait...',
  className = '',
}: SkeletonGroupProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={label}
      className={className}
    >
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
