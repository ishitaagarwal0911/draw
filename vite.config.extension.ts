import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Extension-specific Vite configuration
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "draw-extension",
    rollupOptions: {
      input: {
        newtab: path.resolve(__dirname, "src/main.tsx"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'newtab.css';
          }
          return '[name].[ext]';
        },
        manualChunks: undefined,
      },
    },
    cssCodeSplit: false,
    minify: false, // Keep readable for development
    sourcemap: false,
    emptyOutDir: false, // Don't delete existing extension files
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});