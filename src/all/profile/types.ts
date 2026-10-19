export interface GithubUserProfile {
  readonly login: string;
  readonly avatarUrl: string;
  readonly name?: string;
  readonly bio?: string;
  readonly location?: string;
  readonly company?: string;
  readonly blog?: string;
  readonly twitterUsername?: string;
  readonly publicRepos?: number;
  readonly followers?: number;
  readonly following?: number;
  readonly updatedAt?: string;
}

export interface FetchProfileParams {
  readonly username?: string;
  readonly token?: string;
  readonly signal?: AbortSignal;
}

export interface ProfilePhotoProps {
  readonly username?: string;
  readonly token?: string;
  readonly alt?: string;
  readonly fallbackSrc?: string;
  readonly secondarySrc?: string;
  readonly secondaryAlt?: string;
  readonly className?: string;
  readonly gridSize?: number;
  readonly pixelColor?: string;
  readonly animationStepDuration?: number;
}

export interface ProfileHeaderProps {
  readonly username?: string;
  readonly token?: string;
  readonly defaultName?: string;
  readonly defaultBio?: string;
  readonly defaultLocation?: string;
  readonly className?: string;
}
