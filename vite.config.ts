/// <reference types="vitest" />

import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 8100,
    proxy: {
      '/api/dify': {
        target: 'https://api.dify.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/dify/, '')
      },
      '/api/feishu': {
        target: 'https://open.feishu.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/feishu/, ''),
        headers: {
          'Origin': 'https://open.feishu.cn'
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
