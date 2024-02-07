import { ChatMessage, ChatObject } from '@/components/chat/chat.types.ts';
import { Observable } from '@legendapp/state';

export function addMessage(messages$: Observable<ChatMessage[]>, message: ChatMessage) {
  const MAX_MESSAGES = 60;

  if (messages$.peek().length >= MAX_MESSAGES) {
    messages$.set((messages) => messages.slice(1));
  }

  messages$.set((messages) => {
    return [...messages, message];
  });
}

export function removeMessage(messages$: Observable<ChatMessage[]>, messageId: string) {
  messages$.set((messages) => messages.filter((message) => message.id !== messageId));
  console.log('Removed message with id', messageId);
}

export function removeUserMessages(messages$: Observable<ChatMessage[]>, userId: string) {
  messages$.set((messages) => messages.filter((message) => message.username.id !== userId));
  console.log('Removed messages from user with id', userId);
}

export function clearMessages(messages$: Observable<ChatMessage[]>) {
  messages$.set([]);
}

export function parseEmotes(text: (string | ChatObject)[], emotes?: ChatObject[]): (string | ChatObject)[] {
  const parsedArray: (string | ChatObject)[] = [];
  if (!emotes) {
    parsedArray.push(...text); // spread the text array into parsedArray
    return parsedArray;
  }

  text.forEach((item) => {
    if (typeof item === 'string') {
      const words = item.split(/\s+/);

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
      // if item is a ChatObject, just push it to parsedArray
      parsedArray.push(item);
    }
  });

  return parsedArray;
}

export function parseEmotesByPosition(
  segmentsArray: (string | ChatObject)[],
  emotePositions: { start: number; end: number; url: string }[],
): (string | ChatObject)[] {
  const segments: (string | ChatObject)[] = [];
  let currentPosition = 0;

  emotePositions.forEach(({ start, end, url }) => {
    while (currentPosition < start && segmentsArray.length) {
      const currentSegment = segmentsArray.shift();
      if (typeof currentSegment === 'string') {
        // If the currentSegment is a string and is longer than the distance to the start,
        // split the string and push the first part to segments.
        if (currentSegment.length > start - currentPosition) {
          segments.push(currentSegment.substring(0, start - currentPosition));
          // Place the remainder back at the front of the segmentsArray.
          segmentsArray.unshift(currentSegment.substring(start - currentPosition));
          currentPosition = start;
        } else {
          // If the string does not reach the 'start', just push it to segments.
          segments.push(currentSegment);
          currentPosition += currentSegment.length;
        }
      } else if (currentSegment !== undefined) {
        // If it's a ChatObject, just append it.
        segments.push(currentSegment);
        currentPosition += currentSegment.name.length;
      }
    }
    // Now we are at the position where the emote should be inserted.
    if (currentPosition === start && segmentsArray.length) {
      // Add the emote ChatObject.
      const emoteName =
        segmentsArray.length && typeof segmentsArray[0] === 'string'
          ? segmentsArray[0].substring(0, end - start + 1)
          : '';
      segments.push({ type: 'emote', name: emoteName, url });

      // Update the first element of segmentsArray if it's a string.
      if (segmentsArray.length && typeof segmentsArray[0] === 'string') {
        segmentsArray[0] = segmentsArray[0].substring(end - start + 1);
      }

      currentPosition = end + 1;
    }
  });

  // Append any remaining segments.
  segments.push(...segmentsArray);

  return segments;
}
