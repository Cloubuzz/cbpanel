import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/adminapi': {
        target: 'https://adminapi.broadwaypizza.com.pk',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});