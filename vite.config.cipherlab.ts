import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'cipherlab'),
  base: '/',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'cipherlab-dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'cipherlab/index.html'),
    },
  },
  server: {
    port: 5178,
    host: true,
  },
});
