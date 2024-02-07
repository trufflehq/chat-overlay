import { useStyleSheet } from '@/deps/styles.ts';
import { testTheme } from './test-theme.chat.scss.ts';
import { Message } from '@/components/message/message.tsx';
import { observable, observer, ObservableArray, Observable, useObservable } from '@/deps/legend.ts';
import { registerYouTubeChat } from '../../shared/youtube.ts';
import { registerTwitchChat } from '../../shared/twitch.ts';
import { ChatMessage } from './chat.types.ts';
import { themeEventEmitter } from '../../shared/theme.ts';
import { getOrgResponse } from '@/shared/graphql.ts';
import { styleSheet } from './chat.scss.ts';

type ChatProps = {
  sourceType?: string;
  handle?: string;
  settings?: {
    themeDuration?: number;
  };
};

const WEBSOCKET_URL = 'ws://0.0.0.0:8787';

// always use const for components (important so we can wrap components in Legend's observer method)
export const Chat = ({ sourceType, handle, settings }: ChatProps) => {
  useStyleSheet(styleSheet);
  useStyleSheet(testTheme);

  console.log('Chat settings', settings);

  const theme$ = observable<string>('default');

  useObservable(() => {
    const changeThemeListener = (newTheme: string) => {
      theme$.set(newTheme);
      console.log('Theme changed to', newTheme);
    };

    themeEventEmitter.on('changeTheme', changeThemeListener);
    return () => {
      themeEventEmitter.off('changeTheme', changeThemeListener);
    };
  });

  const isLive$ = observable<boolean>(true);
  const messages$ = observable<ChatMessage[]>([]);

  if (handle !== undefined && sourceType !== undefined) {
    const orgQuery = getOrgResponse(handle, sourceType);

    orgQuery.then((orgResponse) => {
      console.log('Org Response', orgResponse);

      if (orgResponse.data.channel !== null) {
        const orgId = orgResponse.data.channel.orgId;

        if (orgId !== undefined) {
          console.log('Org ID', orgId);

          const webhookWebsocket = new WebSocket(WEBSOCKET_URL + `?orgId=${orgId}`);

          webhookWebsocket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            const { theme } = data;

            // Add the received theme to the queue
            themeQueue.push(theme);

            // If the queue is not being processed, start processing it
            if (!isProcessingQueue) {
              isProcessingQueue = true;
              processThemeQueue();
            }
          };

          const ONE_SECOND_MS = 1000;
          const themeQueue: string[] = []; // Store the themes in a queue
          const DEFAULT_THEME = 'default'; // Set your default theme
          let currentTheme = DEFAULT_THEME; // Initialize with the default theme
          let isProcessingQueue = false; // Flag to track if the queue is being processed

          function processThemeQueue() {
            if (themeQueue.length > 0) {
              // Get the next theme from the queue
              const nextTheme = themeQueue.shift();

              // Apply the current theme
              if (nextTheme !== undefined) {
                currentTheme = nextTheme;
                setTheme(currentTheme);
                console.log('Theme changed to', currentTheme);
              }

              // Schedule the timer to switch to the next theme
              setTimeout(
                () => {
                  processThemeQueue(); // Continue processing the queue
                },
                settings?.themeDuration ?? 30 * ONE_SECOND_MS,
              ); // 30 seconds in milliseconds
            } else {
              // If the queue is empty, revert to the default theme
              if (currentTheme !== DEFAULT_THEME) {
                currentTheme = DEFAULT_THEME;
                setTheme(currentTheme);
                console.log('Theme changed to', currentTheme);
              }
              isProcessingQueue = false; // Reset the processing flag
            }
          }

          function setTheme(theme: string) {
            // Implement logic to set the theme here
            theme$.set(theme);
          }
        }
      }

      switch (sourceType) {
        case 'youtube':
          registerYouTubeChat(handle, messages$, isLive$);
          break;
        case 'twitch':
          registerTwitchChat(handle, messages$);
          break;
      }
    });
  }

  return (
    <>
      <ChatBox messages$={messages$} isLive$={isLive$} theme$={theme$} />
    </>
  );
};

const ChatBox = observer(
  ({
    messages$,
    isLive$,
    theme$,
  }: {
    messages$: ObservableArray<ChatMessage[]>;
    isLive$: Observable<boolean>;
    theme$: Observable<string>;
  }) => {
    const currentTheme = theme$.get();

    return (
      <div className={`c-chatbox ${currentTheme !== 'default' ? `c-chatbox-${currentTheme}` : ''}`}>
        {currentTheme === 'test-theme' && (
          <>
            <img className="foreground" src="../heart-bubble.svg" style={{ position: 'absolute', top: 5, right: 5 }} />
            {/* <video className="video background" src="../fire.webm" autoPlay loop muted />
            <video className="video foreground" src="../peepo.webm" autoPlay loop muted /> */}
          </>
        )}
        {isLive$.get() ? (
          <div className="chat">
            <MessageList messages$={messages$} />
          </div>
        ) : (
          <div className="offline">
            <img src="../logomark.svg" />
            <div>Stream is offline</div>
          </div>
        )}
      </div>
    );
  },
);

const MessageList = observer(({ messages$ }: { messages$: ObservableArray<ChatMessage[]> }) => {
  return (
    <>
      {messages$.map((message) => (
        <Message
          key={message.id.get()}
          id={message.id.get()}
          badges={message.badges.get()}
          username={message.username.get()}
          content={message.content.get()}
        />
      ))}
    </>
  );
});
