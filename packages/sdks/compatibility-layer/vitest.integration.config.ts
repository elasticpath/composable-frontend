import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "node", // Use node for MSW server
    include: ["src/__integration__/**/*.test.ts"],
    testTimeout: 10000, // Allow more time for integration tests
    hookTimeout: 10000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/__integration__/**",
        "src/index.ts",
      ],
    },
  },
})
