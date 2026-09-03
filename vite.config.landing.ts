import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Dedicated Vite config for building Grassroot Digital landing page
export default defineConfig({
  root: path.resolve(__dirname, 'landing'),
  base: '/',
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'landing-dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'landing/index.html'),
    },
  },
  server: {
    port: 5174,
    host: true,
  },
});
