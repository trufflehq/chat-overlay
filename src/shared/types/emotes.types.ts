export type TruffleEmote = {
  id: string;
  sourceType: string;
  name: string;
  urlParams: [string];
  isCollectibleRequired: boolean;
};

export type TruffleEmoteSource = {
  sourceType: string;
  urlTemplate: string;
};

export type BTTVUser = {
  id: string;
  channelEmotes: BTTVEmote[];
  sharedEmotes: BTTVEmote[];
};

export type SevenTVUser = {
  id: string;
  emote_set: SevenTVEmoteSet;
};

export type SevenTVEmoteSet = {
  emotes: SevenTVEmote[];
};

export type BTTVEmote = {
  id: string;
  code: string;
  imageType: string;
};

export type SevenTVEmote = {
  id: string;
  name: string;
  data: {
    flags: number;
  };
};

export type FFZEmote = {
  id: string;
  code: string;
};
