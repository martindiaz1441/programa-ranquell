import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import legacy from "@vitejs/plugin-legacy";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    legacy({
      // corrige el warning: definimos los navegadores a soportar
      targets: ["defaults", "not IE 11"], 
      modernPolyfills: true,
      renderLegacyChunks: true,
    }),
    VitePWA({
      registerType: "autoUpdate",
      selfDestroying: true, // <— desactiva el SW en prod (hasta que terminemos)
      workbox: { navigateFallback: "index.html" },
      manifest: {
        name: "RANQUEL",
        short_name: "RANQUEL",
        start_url: "/",
        display: "standalone",
        theme_color: "#15703e",
        icons: [] // opcional, podés agregar tus iconos
      }
    })
  ]
});
