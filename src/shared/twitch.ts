import { ObservableArray } from '@/deps/legend.ts';
import { ChatMessage, ChatObject } from '@/components/chat/chat.types.ts';
import { getTwitchBadges, getTwitchGlobalBadges, getUsernameColor } from './users.ts';
import {
  addMessage,
  clearMessages,
  parseEmotes,
  parseEmotesByPosition,
  removeMessage,
  removeUserMessages,
} from './shared.ts';
import { tmi } from '@/deps/tmi.ts';
import { getAllEmotes } from './emotes.ts';
import { parseEmojis } from './twemoji.ts';
import { getOrgResponse } from './graphql.ts';

async function getTwitchBroadcasterId(handle: string) {
  const orgQuery = await getOrgResponse(handle, 'twitch');

  const broadcasterId = orgQuery.data.channel.sourceId;

  return broadcasterId;
}

// Helper function to convert position string to start and end numbers
const positionToRange = (position: string): [number, number] => {
  const [start, end] = position.split('-').map(Number);
  return [start, end];
};

export async function registerTwitchChat(handle: string, messages$: ObservableArray<ChatMessage[]>) {
  const client = new tmi.Client({
    connection: {
      secure: true,
      reconnect: true,
    },
    channels: [handle],
  });

  client.connect().catch(console.error);

  client.on('connected', async () => {
    console.log('Twitch Chat Overlay connected');
  });

  const broadcasterId = await getTwitchBroadcasterId(handle);

  const twitchGlobalBadges = await getTwitchGlobalBadges();
  const twitchBadges = await getTwitchBadges(broadcasterId);

  const allBadges = twitchBadges?.badges.data.concat(twitchGlobalBadges?.badges.data ?? []);

  const emotes = await getAllEmotes(broadcasterId, 'twitch');

  client.on('message', async (channel, tags, twitchMessage, self) => {
    if (self) return;

    if (tags['message-type'] !== 'chat') return;

    const badges: ChatObject[] = [];
    const twitchEmotes = tags.emotes;
    const twitchBadges = tags.badges;
    const twitchUsername = tags['display-name'] || tags.username;
    const twitchMessageId = tags.id;
    const twitchColor = tags.color;
    if (twitchUsername === undefined || twitchMessageId === undefined || twitchColor === undefined) return;
    const color = getUsernameColor(twitchUsername, twitchColor);

    if (twitchBadges !== undefined && twitchBadges !== null) {
      Object.entries(twitchBadges).forEach(([badgeName, versionId]) => {
        const badgeUrl = allBadges
          ?.find((badge) => badge.set_id === badgeName)
          ?.versions.find((version) => version.id === versionId)?.image_url_4x;
        if (badgeUrl !== undefined && badgeUrl !== null) {
          badges.push({
            type: 'badge',
            name: badgeName,
            url: badgeUrl,
          });
        }
      });
    }

    const twitchMessageWithEmojis = parseEmojis(twitchMessage);

    let twitchMessageWithTwitchEmotes: (string | ChatObject)[] = [];

    if (twitchEmotes !== undefined && twitchEmotes !== null) {
      const emotePositions: { start: number; end: number; url: string }[] = [];

      Object.entries(twitchEmotes).forEach(([emoteId, positions]) => {
        positions.forEach((position) => {
          const [start, end] = positionToRange(position);
          emotePositions.push({
            start,
            end,
            url: `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/1.0`,
          });
        });
      });

      emotePositions.sort((a, b) => a.start - b.start);

      twitchMessageWithTwitchEmotes = parseEmotesByPosition(twitchMessageWithEmojis, emotePositions);
    } else {
      twitchMessageWithTwitchEmotes = twitchMessageWithEmojis;
    }

    const twitchMessageWithEmotes = parseEmotes(twitchMessageWithTwitchEmotes, emotes);

    const message: ChatMessage = {
      id: twitchMessageId,
      badges: badges,
      username: {
        id: tags['user-id'] || '',
        text: twitchUsername,
        color: color,
      },
      content: twitchMessageWithEmotes,
    };

    addMessage(messages$, message);
  });

  client.on('messagedeleted', (channel, username, deletedMessage, userstate) => {
    const targetId = userstate['target-msg-id'];
    console.log(targetId);
    if (targetId === undefined) return;
    removeMessage(messages$, targetId);
  });

  client.on('clearchat', (channel) => {
    console.log('Chat cleared ' + channel);
    clearMessages(messages$);
  });

  client.on('ban', (channel, username, reason, userstate) => {
    console.log('User banned ' + username);
    const targetId = userstate['target-user-id'];
    console.log(targetId);
    if (targetId === undefined) return;
    removeUserMessages(messages$, targetId);
  });

  client.on('timeout', (channel, username, reason, duration, userstate) => {
    console.log('User timed out ' + username);
    const targetId = userstate['target-user-id'];
    console.log(targetId);
    if (targetId === undefined) return;
    removeUserMessages(messages$, targetId);
  });
}
