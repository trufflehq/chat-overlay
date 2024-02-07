import {
  UserRecord,
  SerializedInfoMap,
  UserInfo,
  SerializedMetadata,
  TruffleBadge,
  TwitchBadge,
} from './types/users.types.ts';
import { tinycolor } from '@/deps/tinycolor.ts';

function unserializeMetadata(userInfo: SerializedInfoMap): UserRecord {
  const userRecords: UserRecord = {};
  userInfo.forEach((user: [string, SerializedMetadata]) => {
    const id = user[0];
    const info = user[1];

    const userInfo: UserInfo = {
      name: info.a,
      nameColor: info.c,
      emotes: info.d,
      badges: info.e,
      hasCollectible: info.f,
      highlightColor: info.g,
      nameGradientColor: info.h,
    };

    userRecords[id] = userInfo;
  });
  return userRecords;
}

export const getUsers = async (channelId: string): Promise<UserRecord | undefined> => {
  try {
    const res = await fetch(`https://v2.truffle.vip/gateway/users/v2/c/${channelId}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.info('Truffle: ' + res.status);
      return undefined;
    }
    const data: SerializedInfoMap = await res.json();
    return unserializeMetadata(data);
  } catch (e) {
    console.error(e);
  }
};

export const getTruffleBadges = async () => {
  try {
    const res = await fetch(`https://v2.truffle.vip/gateway/badges`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.info('Truffle Badges: ' + res.status);
      return undefined;
    }
    const data: TruffleBadge[] = await res.json();
    return data;
  } catch (e) {
    console.error(e);
  }
};

export const getTwitchGlobalBadges = async () => {
  try {
    const res = await fetch(`http://localhost:8787/getTwitchGlobalBadges`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.info('Twitch Global Badges: ' + res.status);
      return undefined;
    }
    const data: TwitchBadge = await res.json();
    return data;
  } catch (e) {
    console.error(e);
  }
};

export const getTwitchBadges = async (broadcasterId: string) => {
  try {
    const res = await fetch(`http://localhost:8787/getTwitchBadges?broadcasterId=${broadcasterId}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      console.info('Twitch Badges: ' + res.status);
      return undefined;
    }
    const data: TwitchBadge = await res.json();
    return data;
  } catch (e) {
    console.error(e);
  }
};

function getRandomColor(username: string) {
  const COLORS = [
    // Red
    '#ff0000',
    // Green
    '#008000',
    // Brown
    '#b22222',
    // Orange
    '#ff7f50',
    // Orange Red
    '#ff4500',
    // Dark Green
    '#2e8b57',
    // Yellow
    '#daa520',
    // Brown Red
    '#d2691e',
    // Blue Green
    '#5f9ea0',
    // Light Blue
    '#1e90ff',
    // Pink
    '#ff69b4',
    // Purple
    '#8a2be2',
    // Light Green
    '#00ff7f',
  ];

  // Use the username to consistently assign the same color to the same user
  const index = [...username].reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLORS.length;
  return COLORS[index];
}

export function getUsernameColor(username: string, color?: string) {
  let usernameColor = color || getRandomColor(username);

  usernameColor =
    tinycolor(usernameColor).getBrightness() <= 50 ? tinycolor(usernameColor).lighten(30).toString() : usernameColor;

  return usernameColor;
}
