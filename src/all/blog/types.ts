/**
 * Domain entity representing a Facebook Page Post.
 * Designed for strict immutability and modern TypeScript 6.
 */
export interface FacebookPost {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly date: string;
  readonly rawDate: string;
  readonly readTime: string;
  readonly excerpt: string;
  readonly content: readonly string[];
  readonly imageUrl?: string;
  readonly permalinkUrl: string;
  readonly reactionsCount: number;
  readonly commentsCount: number;
  readonly sharesCount: number;
  readonly placeName?: string;
  readonly story?: string;
}

/**
 * Data Transfer Object (DTO) received from the Cloudflare Worker proxy.
 */
export interface ProxyPostDto {
  readonly id: string;
  readonly message?: string;
  readonly full_picture?: string | null;
  readonly created_time: string;
  readonly permalink_url: string;
  readonly shares_count: number;
  readonly reactions_count: number;
  readonly comments_count: number;
  readonly place_name?: string;
  readonly place_city?: string;
  readonly place_country?: string;
  readonly story?: string;
}

/**
 * Standard envelope returned by the Cloudflare Worker proxy.
 */
export interface ProxyResponseDto {
  readonly success: boolean;
  readonly posts: readonly ProxyPostDto[];
  readonly count: number;
  readonly error?: string;
}
