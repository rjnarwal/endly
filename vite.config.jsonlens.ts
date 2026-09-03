import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'jsonlens'),
  base: '/',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'jsonlens-dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'jsonlens/index.html'),
    },
  },
  server: {
    port: 5176,
    host: true,
  },
});
