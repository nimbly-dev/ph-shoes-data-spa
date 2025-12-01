// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'node:path';

export default defineConfig(({ mode }) => {
  return {
    plugins: [
      react(),
      // Only inline everything when building for production
      mode === 'production' ? viteSingleFile() : null,
    ].filter(Boolean),
    resolve: {
      alias: {
        '@commons/services': path.resolve(__dirname, '../..', 'packages/commons-service/src/services'),
        '@commons/types': path.resolve(__dirname, '../..', 'packages/commons-service/src/types'),
        '@commons/hooks': path.resolve(__dirname, '../..', 'packages/commons-service/src/hooks'),
        '@commons/config': path.resolve(__dirname, '../..', 'packages/commons-service/src/config'),
        '@commons/utils': path.resolve(__dirname, '../..', 'packages/commons-service/src/utils'),
        '@commons/ui': path.resolve(__dirname, '../..', 'packages/commons-ui/src'),
        '@widget-runtime': path.resolve(__dirname, '../..', 'packages/widget-runtime/src'),
        '@widgets/alerts-center': path.resolve(__dirname, '../..', 'packages/widgets/alerts-center/src'),
        '@widgets/alert-editor': path.resolve(__dirname, '../..', 'packages/widgets/alert-editor/src'),
        '@widgets/service-status': path.resolve(__dirname, '../..', 'packages/widgets/service-status/src'),
        '@widgets/settings-toggles': path.resolve(__dirname, '../..', 'packages/widgets/settings-toggles/src'),
        '@widgets/auth-gate': path.resolve(__dirname, '../..', 'packages/widgets/auth-gate/src'),
        '@widgets/account-settings': path.resolve(__dirname, '../..', 'packages/widgets/account-settings/src'),
        '@widgets/catalog-search': path.resolve(__dirname, '../..', 'packages/widgets/catalog-search/src'),
      },
    },
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
