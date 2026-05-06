import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || process.env.VITE_BASE_PATH || '/',
    server: {
      proxy: {
        '/api': 'http://localhost:3200',
      },
    },
  }
})
