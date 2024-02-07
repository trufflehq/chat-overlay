export interface SerializedMetadata {
  /**
   * Youtube ID
   */
  _: string;
  /**
   * Display name
   */
  a?: string;
  /**
   * Subbed months
   */
  b?: number;
  /**
   * Name color
   */
  c?: string;

  /**
   * Encoded Emote indices
   */
  d?: string;

  /**
   * Spore badge slugs
   */
  e?: string[];

  /**
   * Has Spore Collectible
   */
  f?: boolean;

  /**
   * Spore Chat highlight message powerup color
   */
  g?: string;

  /**
   * Name gradient color
   */

  h?: string;
}

export interface UserInfo {
  /**
   * Youtube ID
   */
  id?: string;

  /**
   * Spore Display name
   */
  name?: string;

  /**
   * Spore subbed months
   */
  subbedMonths?: number;

  /**
   * hex color for name color
   */
  nameColor?: string;

  /**
   * Owned Emote slugs
   */
  emotes?: string;

  /**
   * badges
   */
  badges?: string[];

  /**
   * Spore user months subbed
   */
  hasCollectible?: boolean;

  /**
   * Spore Chat highlight message powerup color
   */
  highlightColor?: string;

  /**
   * Name gradient color
   */
  nameGradientColor?: string;
}

export type SerializedInfoMap = [string, SerializedMetadata][];
export type UserRecord = Record<string, UserInfo>;

export type TruffleBadge = {
  slug: string;
  url: string;
};

export type TwitchBadge = {
  badges: {
    data: [
      {
        set_id: string;
        versions: [
          {
            id: string;
            image_url_1x: string;
            image_url_2x: string;
            image_url_4x: string;
            description: string;
            title: string;
          },
        ];
      },
    ];
  };
};
