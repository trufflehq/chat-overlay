import { defineConfig } from 'vite';
// Aliases React to preact/compat
import preact from '@preact/preset-vite';
import { viteSassToCss } from './plugins/sass.js';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, 'root'),
  publicDir: resolve(__dirname, 'public'),
  plugins: [preact(), viteSassToCss()],
  resolve: {
    alias: { '@': resolve(__dirname, './src') },
  },
  // hmr not working w/o optimizeDeps
  // https://github.com/preactjs/prefresh/issues/454#issuecomment-1456491801
  optimizeDeps: {
    include: ['preact/hooks', 'preact/compat', 'preact'],
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'root/index.html'),
      },
    },
  },
});
