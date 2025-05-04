// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
    // Explicitly alias react-dom/server to the edge runtime for production builds
    resolve: {
      alias: {
        "react-dom/server": "react-dom/server.edge",
        "react-dom/server.browser": "react-dom/server.edge",
      },
    },
    // Optional: Address the crypto warning, though likely unrelated to MessageChannel
    // ssr: {
    //   external: ["crypto"],
    // },
  },
});
