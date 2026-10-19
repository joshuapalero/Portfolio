export interface ViewerLocation {
  readonly city: string;
  readonly country: string;
  readonly countryCode: string;
  readonly flag: string;
  readonly isp?: string;
}

export interface ViewerSession {
  readonly id: string;
  readonly isCurrentSession: boolean;
  readonly city: string;
  readonly country: string;
  readonly countryCode: string;
  readonly flag: string;
  readonly browser: string;
  readonly os: string;
  readonly device: 'desktop' | 'mobile' | 'tablet';
  readonly lastSeen: number;
}

export interface LiveViewersData {
  readonly count: number;
  readonly totalVisits: number;
  readonly uniqueVisitors?: number;
  readonly currentViewer: ViewerLocation;
  readonly isLive: boolean;
}

export type ReactionType = 'like';

export interface ReactionItem {
  readonly type: ReactionType;
  readonly label: string;
  readonly defaultCount: number;
}

export const REACTION_ITEMS: readonly ReactionItem[] = [
  { type: 'like', label: 'Like', defaultCount: 0 },
];


