// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { config } from "dotenv";

// Ładowanie zmiennych środowiskowych z pliku .env
config();

// Logowanie zmiennych środowiskowych podczas uruchamiania
console.log("=== Astro Configuration Debug ===");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("Available environment variables:", Object.keys(process.env).filter(key => 
  key.includes('SUPABASE') || key.includes('OPENROUTER') || key.includes('NODE_ENV')
));

// Sprawdzanie kluczowych zmiennych środowiskowych
const envVars = {
  SUPABASE_URL: process.env.SUPABASE_URL ? "SET" : "MISSING",
  PUBLIC_SUPABASE_URL: process.env.PUBLIC_SUPABASE_URL ? "SET" : "MISSING",
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? "SET" : "MISSING",
  PUBLIC_SUPABASE_ANON_KEY: process.env.PUBLIC_SUPABASE_ANON_KEY ? "SET" : "MISSING",
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? "SET" : "MISSING",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? "SET" : "MISSING",
  OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL ? "SET" : "MISSING"
};

console.log("Environment variables status:", envVars);

// Sprawdzanie długości kluczy (bez wyświetlania ich)
if (process.env.OPENROUTER_API_KEY) {
  const keyLength = process.env.OPENROUTER_API_KEY.length;
  const keyPrefix = process.env.OPENROUTER_API_KEY.substring(0, 5);
  console.log(`OpenRouter API Key: ${keyPrefix}... (length: ${keyLength})`);
  
  if (!process.env.OPENROUTER_API_KEY.startsWith('sk-')) {
    console.warn("⚠️  OpenRouter API key format may be incorrect - should start with 'sk-'");
  }
}

if (process.env.PUBLIC_SUPABASE_ANON_KEY) {
  const keyLength = process.env.PUBLIC_SUPABASE_ANON_KEY.length;
  const keyPrefix = process.env.PUBLIC_SUPABASE_ANON_KEY.substring(0, 10);
  console.log(`Supabase Anon Key: ${keyPrefix}... (length: ${keyLength})`);
}

console.log("=== End Astro Configuration Debug ===");

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [react(), sitemap()],
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
