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
    emptyOutDir: false, // Don't clear our static files
    rollupOptions: {
      input: {
        newtab: path.resolve(__dirname, 'src/main.tsx')
      },
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `build/chunks/[name]-[hash].js`,
        assetFileNames: (assetInfo) => {
          // Put CSS files in root, other assets in assets/ folder
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return '[name].[ext]';
          }
          return 'assets/[name]-[hash].[ext]';
        },
      }
    },
    // Optimization settings
    target: 'chrome88',
    minify: 'esbuild',
    sourcemap: false,
    cssMinify: true
  },
  // Don't copy public folder automatically to prevent conflicts
  publicDir: false
})