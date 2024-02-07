import { css } from '@/deps/styles.ts';

export const styleSheet = css`
  :root {
    --color-message: white;
    --color-offline: white;
    --font-family-open-sans: 'open sans', sans-serif;
    --font-size-offline: 4rem;
    --font-size-message: 22px;
    --font-weight-bold: 800;
    --text-shadow-black: 1px 1px 2px black;
    --emote-max-width: 8rem;
    --emote-max-height: 2rem;
    --emoji-size: 2rem;
  }

  @mixin size-and-style($max-width, $max-height, $margin-left) {
    position: relative;
    max-width: var($max-width);
    max-height: var($max-height);
    vertical-align: middle;
    margin-left: var($margin-left);
  }

  .c-chatbox {
    position: absolute;
    top: 10px;
    width: 100%;
    height: calc(100% - 10px);
    overflow: hidden;

    .video {
      position: absolute;
      bottom: 0;
      z-index: 1000;
      width: 100vw;
      max-width: 100%;
      height: auto;
      display: block;
      object-fit: cover;
      object-position: bottom;
      height: 50rem;
    }

    .foreground,
    .background {
      z-index: 1000;
    }

    .offline {
      font-size: var(--font-size-offline);
      color: var(--color-offline);
      text-align: center;
      font-family: var(--font-family-open-sans);
      font-weight: var(--font-weight-bold);
      width: 100%;
      position: absolute;
      top: 50%;
      transform: translate(0, -50%);
    }

    .chat {
      overflow-wrap: anywhere;
      bottom: 0;
      position: absolute;
      padding: 10px;
      overflow: hidden;

      .c-message {
        font-family: var(--font-family-open-sans);
        font-weight: var(--font-weight-bold);
        font-size: var(--font-size-message);
        color: var(--color-message);
        text-shadow: var(--text-shadow-black);
        line-height: 2.1rem;

        .badge {
          width: 16px;
          height: 16px;
          margin-right: 5px;
          margin-bottom: 5px;
          vertical-align: middle;
        }

        .content {
          .emoji,
          .emote,
          .zero-width-emote {
            @include size-and-style(--emote-max-width, --emote-max-height, 2px);
          }

          .zero-width-container {
            display: inline-grid;
            vertical-align: middle;
            margin-left: 2px;

            .zero-width-emote,
            .emote,
            .emoji {
              grid-column: 1;
              grid-row: 1;
              margin: auto;
            }
          }
        }

        .username .emoji {
          @include size-and-style(--emoji-size, --emoji-size, 2px);
        }
      }
    }
  }
`;
