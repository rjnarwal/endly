import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'tokenlens'),
  base: '/',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'tokenlens-dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'tokenlens/index.html'),
    },
  },
  server: {
    port: 5175,
    host: true,
  },
});
