import { ChatObject } from '@/components/chat/chat.types.ts';
import {
  TruffleEmote,
  BTTVEmote,
  FFZEmote,
  BTTVUser,
  SevenTVUser,
  SevenTVEmoteSet,
  TruffleEmoteSource,
} from './types/emotes.types.ts';
import { getTruffleEmoteReponse } from './graphql.ts';

function isZeroWidth(flags: number): boolean {
  // 9th bit = Zero Width Flag
  const mask = 1 << 8; // This will create a number with only the 9th bit set (256 in decimal)

  // Use the bitwise AND operator to check if the 9th bit is set
  return (flags & mask) !== 0;
}

export const getTruffleEmotes = async (
  channelId: string,
  platform: 'twitch' | 'youtube',
): Promise<ChatObject[] | undefined> => {
  const emotesResponse = await getTruffleEmoteReponse(channelId, platform);

  const emotes = emotesResponse.data?.emoteConnection?.nodes ?? [];
  const emoteSources = emotesResponse.data?.emoteSources ?? [];

  const chatObjectEmotes: ChatObject[] = [];

  emotes.forEach((emote: TruffleEmote) => {
    const emoteSource: TruffleEmoteSource = emoteSources.find(
      (source: TruffleEmoteSource) => source.sourceType === emote.sourceType,
    );
    const urlTemplate = emoteSource?.urlTemplate;

    if (urlTemplate !== undefined) {
      const urlParams: [string, string?] = emote.urlParams;
      const url = urlTemplate.replace('{}', urlParams[0]).replace('{}', urlParams[1] ?? '.png');

      if (!emote.isCollectibleRequired) {
        chatObjectEmotes.push({
          type: 'emote',
          name: emote.name,
          url: url,
        });
      }
    }
  });

  return chatObjectEmotes;
};

const getBTTVGlobalEmotes = async (): Promise<ChatObject[] | undefined> => {
  try {
    const res = await fetch(`https://api.betterttv.net/3/cached/emotes/global`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.info('BTTV: ' + res.status);
      return undefined;
    }
    const data: BTTVEmote[] = await res.json();

    return data?.map((emote) => {
      return {
        type: 'emote',
        url: `https://cdn.betterttv.net/emote/${emote.id}/1x`,
        name: emote.code,
      };
    });
  } catch (e) {
    console.error(e);
  }
};

const get7TVGlobalEmotes = async (): Promise<ChatObject[] | undefined> => {
  try {
    const res = await fetch(`https://7tv.io/v3/emote-sets/global`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.info('7TV: ' + res.status);
      return undefined;
    }
    const data = await res.json();
    const user: SevenTVEmoteSet = data;
    return user.emotes?.map((emote) => {
      if (isZeroWidth(emote.data.flags)) {
        return {
          type: 'zero-width-emote',
          url: `https://cdn.7tv.app/emote/${emote.id}/1x.webp`,
          name: emote.name,
        };
      } else {
        return {
          type: 'emote',
          url: `https://cdn.7tv.app/emote/${emote.id}/1x.webp`,
          name: emote.name,
        };
      }
    });
  } catch (e) {
    console.error(e);
  }
};

const getFFZGlobalEmotes = async (): Promise<ChatObject[] | undefined> => {
  try {
    const res = await fetch(`https://api.betterttv.net/3/cached/frankerfacez/emotes/global`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.info('FFZ: ' + res.status);
      return undefined;
    }
    const data: FFZEmote[] = await res.json();
    return data?.map((emote) => {
      return {
        type: 'emote',
        url: `https://cdn.betterttv.net/frankerfacez_emote/${emote.id}/1`,
        name: emote.code,
      };
    });
  } catch (e) {
    console.error(e);
  }
};

const getBTTVEmotes = async (channelId: string, platform: 'twitch' | 'youtube'): Promise<ChatObject[] | undefined> => {
  try {
    const res = await fetch(`https://api.betterttv.net/3/cached/users/${platform}/${channelId}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.info('BTTV: ' + res.status);
      return undefined;
    }
    const data = await res.json();
    const user: BTTVUser = data;
    const emotes = user.channelEmotes.concat(user.sharedEmotes);
    return emotes?.map((emote) => {
      return {
        type: 'emote',
        url: `https://cdn.betterttv.net/emote/${emote.id}/1x`,
        name: emote.code,
      };
    });
  } catch (e) {
    console.error(e);
  }
};

const get7TVEmotes = async (channelId: string, platform: 'twitch' | 'youtube'): Promise<ChatObject[] | undefined> => {
  try {
    const res = await fetch(`https://7tv.io/v3/users/${platform}/${channelId}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.info('7TV: ' + res.status);
      return undefined;
    }
    const data = await res.json();
    const user: SevenTVUser = data;
    return user.emote_set.emotes?.map((emote) => {
      if (isZeroWidth(emote.data.flags)) {
        return {
          type: 'zero-width-emote',
          url: `https://cdn.7tv.app/emote/${emote.id}/1x.webp`,
          name: emote.name,
        };
      } else {
        return {
          type: 'emote',
          url: `https://cdn.7tv.app/emote/${emote.id}/1x.webp`,
          name: emote.name,
        };
      }
    });
  } catch (e) {
    console.error(e);
  }
};

const getFFZEmotes = async (channelId: string, platform: 'twitch' | 'youtube'): Promise<ChatObject[] | undefined> => {
  try {
    const res = await fetch(`https://api.betterttv.net/3/cached/frankerfacez/users/${platform}/${channelId}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.info('FFZ: ' + res.status);
      return undefined;
    }
    const data: FFZEmote[] = await res.json();
    return data?.map((emote) => {
      return {
        type: 'emote',
        url: `https://cdn.betterttv.net/frankerfacez_emote/${emote.id}/1`,
        name: emote.code,
      };
    });
  } catch (e) {
    console.error(e);
  }
};
//Combine all the emotes into one array

export const getAllEmotes = async (broadcasterId: string, platform: 'twitch' | 'youtube'): Promise<ChatObject[]> => {
  const truffleEmotes = await getTruffleEmotes(broadcasterId, platform);

  const sevenTVGlobalEmotes = await get7TVGlobalEmotes();
  const bttvGlobalEmotes = await getBTTVGlobalEmotes();
  const ffzGlobalEmotes = await getFFZGlobalEmotes();

  const sevenTVEmotes = await get7TVEmotes(broadcasterId, platform);
  const bttvEmotes = await getBTTVEmotes(broadcasterId, platform);
  const ffzEmotes = await getFFZEmotes(broadcasterId, platform);

  const allEmotes: ChatObject[] = [
    ...new Map(
      [
        ...(ffzGlobalEmotes ?? []),
        ...(ffzEmotes ?? []),
        ...(bttvGlobalEmotes ?? []),
        ...(bttvEmotes ?? []),
        ...(sevenTVGlobalEmotes ?? []),
        ...(sevenTVEmotes ?? []),
        ...(truffleEmotes ?? []),
      ].map((emote) => [emote.name, emote]),
    ).values(),
  ];

  return allEmotes;
};
