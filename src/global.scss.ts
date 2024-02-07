import { css } from './deps/styles.ts';

export const styleSheet = css`
  html,
  body,
  #app {
    height: 100%;
    color: #fff;
    /* background-image: url('../output.gif');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center; */
    background-color: transparent;
    /* background-color: #282828; */
  }
  body {
    margin: 0;
  }

  /* NOTE: we shouldn't really have other global styles, styles should be self-contained in components */
`;
