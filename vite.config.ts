import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
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
      outDir: "dist",
      rollupOptions: {
        input: {
          newtab: path.resolve(__dirname, "src/main.tsx"),
        },
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "[name]-[hash].js",
          assetFileNames: "[name]-[hash].[ext]",
        },
      },
      // Asset optimization
      assetsInlineLimit: 4096,
      sourcemap: false,
      minify: 'esbuild',
    },
    // Copy public files to build root
    publicDir: "public",
  };
});