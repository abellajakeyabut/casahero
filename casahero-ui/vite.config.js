import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    minify: false, // 🚫 disables minification
    terserOptions: {}, // ensure no terser compression
  },
});
