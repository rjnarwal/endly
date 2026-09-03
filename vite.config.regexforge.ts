import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'regexforge'),
  base: '/',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'regexforge-dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'regexforge/index.html'),
    },
  },
  server: {
    port: 5177,
    host: true,
  },
});
