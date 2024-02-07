import { Observable, ObservableArray } from '@/deps/legend.ts';
import { ChatMessage, ChatObject } from '../components/chat/chat.types.ts';
import { ChatResponse, YTString, isTextRun } from './types/youtube.types.ts';
import { getAllEmotes } from './emotes.ts';
import { getTruffleBadges, getUsernameColor, getUsers } from './users.ts';
import { TruffleBadge, UserRecord } from './types/users.types.ts';
import { addMessage, removeMessage } from './shared.ts';

export async function registerYouTubeChat(
  handle: string,
  messages$: ObservableArray<ChatMessage[]>,
  isLive$: Observable<boolean>,
) {
  // Fetch initial chat
  const initialChat = await fetchChat({ handle: handle });

  const chat = initialChat.chat;

  if (chat == null || chat === undefined) {
    console.log('Stream is offline, retrying in 60 seconds');
    isLive$.set(false);
    setTimeout(() => {
      registerYouTubeChat(handle, messages$, isLive$);
    }, 60000);
    return;
  }

  const channelId = chat.channelId;

  const emotes = await getAllEmotes(channelId ?? handle, 'youtube');
  const truffleBadges = await getTruffleBadges();
  let users = await getUsers(channelId ?? handle);
  let nextContinuation = chat.nextContinuation;

  const ONE_SECOND_MS = 1000;
  const FIVE_SECOND_MS = 5 * ONE_SECOND_MS;
  const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;

  if (chat == null || nextContinuation === undefined) {
    // If there is no nextContinuation, the stream has probably ended
    console.log('Stream is offline, retrying in 60 seconds');
    isLive$.set(false);
    setTimeout(() => {
      registerYouTubeChat(handle, messages$, isLive$);
    }, ONE_MINUTE_MS);
  }

  isLive$.set(true);

  if (emotes !== undefined && users !== undefined && truffleBadges !== undefined) {
    addMessages(initialChat, messages$, emotes, truffleBadges, users);
  }

  setInterval(async () => {
    users = await getUsers(initialChat.chat?.channelId ?? handle);
  }, FIVE_SECOND_MS);

  const intervalId = setInterval(async () => {
    if (nextContinuation === undefined) return;
    // Fetch chat with the latest nextContinuation
    const tokenChat = await fetchChat({ continuationToken: nextContinuation });

    if (tokenChat.chat === undefined) return;

    // Update nextContinuation for the next round
    nextContinuation = tokenChat.chat?.nextContinuation;

    if (nextContinuation === undefined) {
      // If there is no nextContinuation, the stream has probably ended
      console.log('Stream is offline, retrying in 60 seconds');
      isLive$.set(false);
      clearInterval(intervalId);
      setTimeout(() => {
        registerYouTubeChat(handle, messages$, isLive$);
      }, ONE_MINUTE_MS);
      return;
    }

    isLive$.set(true);

    if (emotes !== undefined && users !== undefined && truffleBadges !== undefined) {
      addMessages(tokenChat, messages$, emotes, truffleBadges, users);
    }
  }, ONE_SECOND_MS);
}

type FetchChatProps = {
  handle?: string;
  continuationToken?: string;
};

async function fetchChat({ handle, continuationToken }: FetchChatProps): Promise<ChatResponse> {
  let url: string;
  if (handle !== undefined) {
    url = `https://olympusdev.xyz/getChat?handle=${handle}`;
  } else if (continuationToken !== undefined) {
    url = `https://olympusdev.xyz/getChat?continuationToken=${continuationToken}`;
  } else {
    return Promise.reject('No handle or continuation token provided');
  }
  const response = await fetch(url);
  const json = await response.json();
  const chatResponse: ChatResponse = json;
  return chatResponse;
}

function addMessages(
  chat: ChatResponse,
  messages$: ObservableArray<ChatMessage[]>,
  emotes: ChatObject[],
  truffleBadges: TruffleBadge[],
  users: UserRecord,
) {
  chat.chat?.actions?.map((action) => {
    if (action.addChatItemAction?.item?.liveChatTextMessageRenderer !== undefined) {
      const id = action.addChatItemAction.item.liveChatTextMessageRenderer.id;
      const userId = action.addChatItemAction.item.liveChatTextMessageRenderer.authorExternalChannelId;
      const username = parseYTString(
        action.addChatItemAction?.item?.liveChatTextMessageRenderer?.authorName,
        emotes,
      ).join('');
      const content = parseYTString(action.addChatItemAction?.item?.liveChatTextMessageRenderer?.message, emotes);

      let badges: ChatObject[] =
        action.addChatItemAction?.item?.liveChatTextMessageRenderer?.authorBadges?.reduce<ChatObject[]>(
          (badgesSoFar, badge) => {
            if (badge.liveChatAuthorBadgeRenderer === undefined) return badgesSoFar;

            const renderer = badge.liveChatAuthorBadgeRenderer;
            const name = badge.liveChatAuthorBadgeRenderer.tooltip;

            if (renderer.icon !== undefined) {
              switch (renderer.icon.iconType) {
                case 'OWNER':
                  badgesSoFar.push({ type: 'badge', name: 'Broadcaster', url: '../TMODERATOR.png' });
                  break;
                case 'VERIFIED':
                  badgesSoFar.push({ type: 'badge', name: 'Verified', url: '../YT_VERIFIED.png' });
                  break;
                case 'MODERATOR':
                  badgesSoFar.push({ type: 'badge', name: 'Moderator', url: '../TMODERATOR.png' });
                  break;
                default:
                  break;
              }
            } else {
              const url = renderer.customThumbnail?.thumbnails[0]?.url ?? '';

              badgesSoFar.push({ type: 'badge', name, url });
            }

            return badgesSoFar;
          },
          [],
        ) ?? [];

      const user = users?.[userId];
      const name = user?.name ?? username;
      const nameColor = getUsernameColor(name, user?.nameColor);
      const nameGradientColor = user?.nameGradientColor;

      const userBadges: ChatObject[] =
        user?.badges?.map((badge) => {
          const url = truffleBadges.find((truffleBadge) => truffleBadge.slug === badge)?.url;
          return { type: 'badge', name: badge, url: url ?? '' };
        }) ?? [];

      badges = badges.concat(userBadges);

      console.log(nameGradientColor);

      const message = {
        id: id,
        badges: badges,
        username: {
          id: userId,
          text: name,
          color: nameColor,
          gradientColor: nameGradientColor,
        },
        content: content,
      };

      addMessage(messages$, message);
    } else if (action.removeChatItemAction?.targetItemId !== undefined) {
      const targetItemId = action.removeChatItemAction?.targetItemId;
      removeMessage(messages$, targetItemId);
    }
  });
}

export function parseYTString(string?: YTString, emotes?: ChatObject[]): (string | ChatObject)[] {
  const parsedArray: (string | ChatObject)[] = [];

  if (!string) return parsedArray;

  if (string.simpleText) {
    parsedArray.push(string.simpleText.trim());
    return parsedArray;
  }

  if (string.runs) {
    string.runs.forEach((run) => {
      if (isTextRun(run)) {
        const text = run.text;

        if (emotes !== undefined) {
          const words = text.split(/\s+/);

          words.forEach((word) => {
            const matchingEmote = emotes.find((emote) => emote.name === word);
            if (matchingEmote) {
              parsedArray.push({
                type: matchingEmote.type,
                name: matchingEmote.name,
                url: matchingEmote.url,
              });
            } else {
              parsedArray.push(' ' + word + ' ');
            }
          });
        } else {
          parsedArray.push(text.trim());
        }
      } else {
        const url = run.emoji.image?.thumbnails[0]?.url || '';
        const name =
          run.emoji.image.accessibility?.accessibilityData?.label ??
          run.emoji.searchTerms[1] ??
          run.emoji.searchTerms[0];
        parsedArray.push({ type: 'emoji', url, name });
      }
    });
  }

  return parsedArray;
}
