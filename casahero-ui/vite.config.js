import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    minify: false, // 🚫 disables minification
    terserOptions: {}, // ensure no terser compression
  },
  test:{
    environment:'jsdom',
    globals:true,
    setupFiles:'./src/test/setup.js',
    coverage:{
      reporter: ['text','html'],
      include:['src/**/*.{js,jsx}'],
      exclude:['src/mocks/**','src/main.jsx','src/test/**'],

    },
  }
});
