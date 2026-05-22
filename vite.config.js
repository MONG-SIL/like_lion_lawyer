import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/moj': {
        target: 'https://apis.data.go.kr/1270000/mojmabyun',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/moj/, ''),
      },
    },
  },
})