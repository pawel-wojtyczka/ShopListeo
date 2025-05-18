// @ts-check
import { defineConfig } from "astro/config";
// import cloudflare from "@astrojs/cloudflare"; // Skomentowane dla Capacitor
import react from "@astrojs/react";
// import sitemap from "@astrojs/sitemap"; // TYMCZASOWO ZAKOMENTOWANE
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "static", // Zmienione z "server" na "static" dla Capacitor
  // adapter: cloudflare(), // Skomentowane dla Capacitor
  integrations: [react() /*, sitemap()*/], // TYMCZASOWO ZAKOMENTOWANE
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias:
        process.env.NODE_ENV === "production"
          ? {
              "react-dom/server": "react-dom/server.edge",
              "react-dom/server.browser": "react-dom/server.edge",
            }
          : {},
    },
    // Optional: Address the crypto warning, though likely unrelated to MessageChannel
    // ssr: {
    //   external: ["crypto"],
    // },
  },
});
