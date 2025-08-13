// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    legacy({
      // Soporte amplio para móviles
      targets: ["defaults", "Android >= 6", "iOS >= 12"],
      modernPolyfills: true,
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    }),
    // Mantengo tu PWA (autoUpdate)
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,webp,ico}"],
      },
      manifest: {
        name: "RANQUEL",
        short_name: "RANQUEL",
        theme_color: "#15703e",
        icons: [
          // Usá tus íconos si tenés; este queda de placeholder
          { src: "/vite.svg", sizes: "192x192", type: "image/svg+xml" },
        ],
      },
    }),
  ],
  build: {
    // Genera JS compatible con navegadores más viejos
    target: "es2018",
    // (opcional) si querés reducir warnings por tamaño
    chunkSizeWarningLimit: 1600,
  },
});
