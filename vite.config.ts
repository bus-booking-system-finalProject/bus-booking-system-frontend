import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist',
  },
  plugins: [
    viteReact({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  test: {
    globals: true, // Ensures global functions like 'expect' are available
    setupFiles: './src/test/setupTests.ts', // Path to your setup file
    environment: 'jsdom', // Use jsdom environment for testing
  },
});
