// NOTE: prettier only works with css`` and not scss``
// so use css`` for now
// https://github.com/prettier/prettier/issues/5588

// these deps used to be pulled from tfl.dev, but now we're using the local versions
// export { default as css } from "https://tfl.dev/@truffle/utils@~0.0.3/css/css.ts";
// import { useStyleSheet } from "https://tfl.dev/@truffle/distribute@^2.0.0/format/wc/react/index.ts";

export function css(strings: TemplateStringsArray, ...values: unknown[]) {
  let cssString = '';
  strings.forEach((str, i) => {
    const value = values[i];
    cssString += str;
    if (value) {
      cssString += value;
    }
  });
  const styleSheet = new CSSStyleSheet();
  // Node/dom shim doesn't seem to support this atm
  styleSheet.replaceSync?.(cssString);
  return styleSheet;
}

export function useStyleSheet(styleSheet: CSSStyleSheet) {
  document.adoptedStyleSheets.push(styleSheet);
}
