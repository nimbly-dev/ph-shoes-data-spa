import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': '{}',
  },
  resolve: {
    alias: {
      '@commons/services': path.resolve(__dirname, '../../commons-service/src/services'),
      '@commons/types': path.resolve(__dirname, '../../commons-service/src/types'),
      '@commons/hooks': path.resolve(__dirname, '../../commons-service/src/hooks'),
      '@commons/utils': path.resolve(__dirname, '../../commons-service/src/utils'),
      '@commons/config': path.resolve(__dirname, '../../commons-service/src/config'),
      '@widget-runtime': path.resolve(__dirname, '../../widget-runtime/src'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'alerts-center.js',
    },
  },
});
