/// <reference types="vitest" />
import { defineConfig, mergeConfig } from "vite";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";

export default mergeConfig(
  defineConfig({
    plugins: [react()],
  }),
  defineConfig({
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: ["./src/__tests__/setup.ts"],
      include: ["src/__tests__/unit/**/*.{test,spec}.{ts,tsx}"],
      exclude: [...configDefaults.exclude, ".astro", "dist"],
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        include: ["src/lib/**/*.{ts,tsx}"],
        exclude: ["**/*.d.ts", "**/*.test.ts", "**/*.spec.ts"],
      },
    },
  })
);
