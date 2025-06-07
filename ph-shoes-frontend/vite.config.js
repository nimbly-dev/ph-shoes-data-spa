// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      // Only inline everything when building for production
      mode === 'production' ? viteSingleFile() : null
    ].filter(Boolean),
    build: {
      // Disable CSS code splitting so CSS is inlined
      cssCodeSplit: false,
      // Place all assets (fonts/images) as base64 or inline references
      assetsInlineLimit: Infinity,
      rollupOptions: {
        // ensure that viteSingleFile can inline dynamic imports
        output: {
          manualChunks: null
        }
      }
    }
  };
});
