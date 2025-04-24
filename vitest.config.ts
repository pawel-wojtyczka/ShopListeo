/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/__tests__/unit/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".astro", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/lib/**/*.{ts,tsx}"],
      exclude: ["**/*.d.ts", "**/*.test.ts", "**/*.spec.ts"],
    },
  },
});
