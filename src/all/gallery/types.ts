import type { FacebookPost } from '../blog/types';

/**
 * Domain entity representing an uploaded photo from the user's Facebook Page.
 * Strictly immutable for high performance and pure render guarantees.
 */
export interface FacebookPhoto {
  readonly id: string;
  readonly imageUrl: string;
  readonly caption: string;
  readonly date: string;
  readonly rawDate: string;
  readonly permalinkUrl: string;
  readonly reactionsCount: number;
  readonly commentsCount: number;
  readonly place?: string;
  readonly event?: string;
  readonly description?: string;
}

export interface GalleryProps {
  readonly sectionNumber?: string;
  readonly sectionTitle?: string;
  readonly subtitle?: string;
  readonly posts?: readonly FacebookPost[];
  readonly isPending?: boolean;
  readonly isError?: boolean;
  readonly error?: Error | null;
  readonly onRetry?: () => void;
  readonly onViewAllGallery?: () => void;
}

export interface GalleryHistoryProps {
  readonly subtitle?: string;
  readonly posts?: readonly FacebookPost[];
  readonly photos?: readonly FacebookPhoto[];
  readonly isPending?: boolean;
  readonly isError?: boolean;
  readonly error?: Error | null;
  readonly onRetry?: () => void;
  readonly onBack?: () => void;
}

export interface GalleryImageProps {
  readonly src: string;
  readonly alt: string;
  readonly className?: string;
  readonly loading?: 'lazy' | 'eager';
  readonly decoding?: 'async' | 'sync' | 'auto';
  readonly showSpinner?: boolean;
}

