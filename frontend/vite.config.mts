import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: null, // Disable auto registration to handle custom SW path manually
      devOptions: { enabled: true }, // Developmentda PWA test qilish uchun
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,jpg,svg}"],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MiB ga oshirish (errorni fix qiladi)
        swDest: "dist/sw.js", // SW ni dist/static/js ichiga joylashtirish
      },
      manifest: {
        name: "Sport AI", // App nomini o'zgartiring
        short_name: "Sport AI",
        description: "Sportchilarning biosignallarini tahlil qilish tizimi",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "static/media/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "static/media/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
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
        entryFileNames: "static/js/[name].[hash].js",
        chunkFileNames: "static/js/[name].[hash].js", // CSS uchun emas, chunklar uchun
        assetFileNames: "static/media/[name].[hash].[ext]",
      },
    },
  },
});
