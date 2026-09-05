import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'pagely'),
  base: '/',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'pagely-dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'pagely/index.html'),
    },
  },
  server: {
    port: 5178,
    host: true,
  },
});
