import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup.js'],
    testTimeout: 30000,
    hookTimeout: 30000
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@server': resolve(__dirname, './server'),
      '@shared': resolve(__dirname, './shared'),
      '@tests': resolve(__dirname, './tests')
    }
  }
})