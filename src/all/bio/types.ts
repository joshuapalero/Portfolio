export interface BioItem {
  readonly rawText: string;
  readonly lines: readonly string[];
  readonly images?: readonly string[];
  readonly source: 'github-repo' | 'fallback';
  readonly sourceUrl?: string;
  readonly lastUpdated?: string;
}

export interface FetchBioParams {
  readonly username?: string;
  readonly repo?: string;
  readonly token?: string;
  readonly signal?: AbortSignal;
}

export interface BioProps {
  readonly username?: string;
  readonly repo?: string;
  readonly token?: string;
}
