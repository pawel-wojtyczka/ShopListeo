/// <reference types="vitest" />
import { defineConfig, mergeConfig } from "vite";
import { configDefaults, defineConfig as defineVitestConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

const viteConfig = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "astro:middleware": resolve(__dirname, "./src/__mocks__/astro-middleware.ts"),
    },
  },
});

const vitestConfig = defineVitestConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/__tests__/unit/**/*.{test,spec}.{ts,tsx}"],
    exclude: [...configDefaults.exclude, ".astro", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/**/*.{ts,tsx}", "src/pages/api/**/*.ts"],
      exclude: ["**/*.d.ts", "**/*.test.ts", "**/*.spec.ts"],
    },
  },
});

export default mergeConfig(viteConfig, vitestConfig);
