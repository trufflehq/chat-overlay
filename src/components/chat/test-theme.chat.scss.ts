import { css } from '@/deps/styles.ts';

export const testTheme = css`
  .c-chatbox-test-theme {
    border-image: linear-gradient(#7c14ff, #f74bfb) 30;
    border-width: 4px;
    border-style: solid;
    box-sizing: border-box;
    background: linear-gradient(179deg, rgba(180, 123, 253, 0.34) 2.04%, rgba(247, 75, 251, 0.34) 99.18%);

    > .chat {
      > .c-message {
        text-shadow: none;
        > .content {
          text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
        }
      }
    }
  }
`;
