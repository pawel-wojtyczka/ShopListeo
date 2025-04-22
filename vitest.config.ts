import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Load .env file - adjust prefix if needed, '' loads all variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
    test: {
      globals: true,
      environment: "jsdom",
      include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
      exclude: ["node_modules/**", "dist/**"],
      setupFiles: ["./src/setupTests.ts"],
      // Pass loaded environment variables to the test environment
      env,
      typecheck: {
        enabled: false,
      },
    },
  };
});
