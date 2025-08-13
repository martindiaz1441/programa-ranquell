// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    legacy({
      // Bajamos targets para móviles más viejos
      targets: ["defaults", "Android >= 5", "iOS >= 10"],
      modernPolyfills: true,
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      renderLegacyChunks: true,
    }),
    // Deploy "de limpieza": desinstala el SW para purgar caches viejas
    VitePWA({
      selfDestroying: true,
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,webp,ico}"],
      },
      manifest: {
        name: "RANQUEL",
        short_name: "RANQUEL",
        theme_color: "#15703e",
        icons: [{ src: "/vite.svg", sizes: "192x192", type: "image/svg+xml" }],
      },
    }),
  ],
  build: {
    target: "es2018",
    chunkSizeWarningLimit: 1600,
  },
});
