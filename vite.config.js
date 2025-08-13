// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["defaults", "Android >= 5", "iOS >= 10"],
      modernPolyfills: true,
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      renderLegacyChunks: true,
    }),
    VitePWA({
      selfDestroying: true, // desinstala el SW viejo y limpia caché en el celu
      registerType: "autoUpdate",
      workbox: { globPatterns: ["**/*.{js,css,html,png,svg,webp,ico}"] },
      manifest: {
        name: "RANQUEL",
        short_name: "RANQUEL",
        theme_color: "#15703e",
        icons: [{ src: "/vite.svg", sizes: "192x192", type: "image/svg+xml" }],
      },
    }),
  ],
  build: {
    // sin target, para que no salga el warning de override del plugin-legacy
    chunkSizeWarningLimit: 1600,
  },
});
