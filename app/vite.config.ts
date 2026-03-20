import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    force: true,
  },
  server: {
    proxy: {
      '/core': {
        target: 'https://d2qt7c82v7o0t.cloudfront.net',
        changeOrigin: true,
        secure: true,
      },
      '/auth': {
        target: 'https://d2qt7c82v7o0t.cloudfront.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
