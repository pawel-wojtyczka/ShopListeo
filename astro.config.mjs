// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["crypto"],
    },
    resolve: {
      // Force usage of edge renderer in production
      alias:
        process.env.NODE_ENV === "production"
          ? {
              "react-dom/server": "react-dom/server.edge",
              "react-dom/server.browser": "react-dom/server.edge",
            }
          : undefined,
    },
  },
  adapter: cloudflare(),
});
