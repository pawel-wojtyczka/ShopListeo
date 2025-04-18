import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    exclude: ["node_modules/**", "dist/**"],
    setupFiles: ["./src/setupTests.ts"],
    typecheck: {
      enabled: false,
    },
  },
});
