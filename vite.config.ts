import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // Check if building for extension
  const isExtension = process.env.BUILD_TARGET === "extension";
  
  if (isExtension) {
    return {
      plugins: [react()],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      build: {
        outDir: "draw-extension",
        emptyOutDir: false,
        rollupOptions: {
          input: {
            newtab: path.resolve(__dirname, "src/extension.tsx"),
          },
          output: {
            entryFileNames: "[name].js",
            chunkFileNames: "[name]-[hash].js",
            assetFileNames: "[name]-[hash].[ext]",
          },
        },
      },
    };
  }

  // Default web app configuration
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          // Enable asset fingerprinting for better caching
          entryFileNames: "assets/[name]-[hash].js",
          chunkFileNames: "assets/[name]-[hash].js", 
          assetFileNames: "assets/[name]-[hash].[ext]",
          // Optimize chunk splitting for better caching
          manualChunks: {
            vendor: ['react', 'react-dom'],
            fabric: ['fabric'],
            ui: ['@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
          }
        }
      },
      // Asset optimization
      assetsInlineLimit: 4096,
      // Enable source maps for production debugging
      sourcemap: false,
      // Minification settings
      minify: 'esbuild',
      // Asset size warnings
      chunkSizeWarningLimit: 1000
    }
  };
});
