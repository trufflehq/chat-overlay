Anything we install via `yarn add` should have it's own file in this deps folder.

The main reason is in case we decide to use URL imports in the future, it'll be easy to swap over to it, by replacing `import ... from 'package:...'` with `import ... from 'https://...'`.
