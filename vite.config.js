"use strict";

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: false,
    outDir: "./dist",
    rollupOptions: {
      output: {
        assetFileNames: "[name][extname]",
        entryFileNames: "js/client.js",
        manualChunks: undefined,
      },
    },
  },
});
