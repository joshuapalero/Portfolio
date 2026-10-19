import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      // Target modern evergreen browsers — prunes unnecessary vendor prefixes
      // that lightningcss would otherwise emit (and re-process) per file.
      targets: {
        chrome: 111 << 16,
        firefox: 112 << 16,
        safari: (16 << 16) | (4 << 8),
        edge: 111 << 16,
      },
    },
  },
  build: {
    cssMinify: 'lightningcss',
    rollupOptions: {
      checks: {
        pluginTimings: false,
      },
    },
    rolldownOptions: {
      checks: {
        pluginTimings: false,
      },
    },
  },
});

