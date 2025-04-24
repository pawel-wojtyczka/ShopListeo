import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  // Załaduj zmienne środowiskowe
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [tsconfigPaths(), react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    test: {
      // Środowisko testowe
      environment: "jsdom",
      // Pliki testów
      include: ["src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
      // Pliki do wykluczenia
      exclude: ["node_modules/**", "dist/**", ".astro/**", "src/__tests__/e2e/**"],
      // Plik konfiguracyjny dla testów
      setupFiles: ["./src/__tests__/setup.ts"],
      // Przekaż zmienne środowiskowe do środowiska testowego
      env,
      // Konfiguracja pokrycia kodu
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        exclude: ["node_modules/**", "src/__tests__/**", "**/*.d.ts", "**/*.config.*", "**/types.ts"],
      },
      // Globalne zmienne
      globals: true,
      // Konfiguracja dla React
      css: true,
      // Konfiguracja zależności
      deps: {
        inline: [/\/node_modules\//],
      },
    },
  };
});
