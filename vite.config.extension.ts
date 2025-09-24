import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // make `@/something` point to `<projectRoot>/src/something`
      '@': path.resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'draw-extension',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `newtab.js`,
        chunkFileNames: `chunks/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      }
    }
  }
})