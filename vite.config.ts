/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  root: './playground',
  plugins: [react(), viteSingleFile()],
  resolve: {
    alias: { 'liquid-glass2': fileURLToPath(new URL('./src/index.ts', import.meta.url)) },
  },
  build: {
    outDir: '../demo',
    emptyOutDir: true,
  },
  test: {
    root: '.',
    environment: 'jsdom',
  },
})
