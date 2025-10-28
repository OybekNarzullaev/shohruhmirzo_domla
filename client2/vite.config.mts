import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist", // 📁 barcha fayllar shu papkaga chiqadi
    assetsDir: ".", // 📦 CSS, JS, img ham static/ ichida bo‘ladi
    emptyOutDir: true, // eski fayllarni o‘chiradi
    manifest: true, // manifest.json fayl yaratadi (Django uchun foydali)
    rollupOptions: {
      output: {
        // Fayl nomlarini tartib bilan yozadi
        entryFileNames: "js/[name].[hash].js",
        chunkFileNames: "css/[name].[hash].js",
        assetFileNames: "media/[name].[hash].[ext]",
      },
    },
  },

  // 🔹 Static fayllar uchun baza (agar Django static URL bilan ishlasa)
  base: "/static/",
});
