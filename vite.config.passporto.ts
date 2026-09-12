import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'passporto'),
  base: '/passport-photo-maker/',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'passporto-dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'passporto/index.html'),
    },
  },
  server: {
    port: 5179,
    host: true,
  },
});
