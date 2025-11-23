// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      // Only inline everything when building for production
      mode === 'production' ? viteSingleFile() : null,
    ].filter(Boolean),
    server: {
      proxy: {
        // Alerts service
        '/api/v1/alerts': {
          target: 'http://localhost:8084',
          changeOrigin: true,
        },
        // Catalog service
        '/api/v1/fact-product-shoes': {
          target: process.env.VITE_CATALOG_API_BASE_URL || 'http://localhost:8083',
          changeOrigin: true,
        },
        // User accounts (auth + account)
        '/api/v1/user-accounts': {
          target: process.env.VITE_USER_ACCOUNTS_API_BASE_URL || 'http://localhost:8082',
          changeOrigin: true,
        },
        '/api/v1/auth': {
          target: process.env.VITE_USER_ACCOUNTS_API_BASE_URL || 'http://localhost:8082',
          changeOrigin: true,
        },
      },
    },
    build: {
      // Disable CSS code splitting so CSS is inlined
      cssCodeSplit: false,
      // Place all assets (fonts/images) as base64 or inline references
      assetsInlineLimit: Infinity,
      rollupOptions: {
        // ensure that viteSingleFile can inline dynamic imports
        output: {
          manualChunks: null,
        },
      },
    },
  };
});
