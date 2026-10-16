import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["src/**/*.{test,spec}.ts", "test/**/*.{test,spec}.ts"],
    setupFiles: ["./src/test/setup.ts"],
    typecheck: {
      enabled: true,
      include: ["src/**/*.test-d.ts"],
      tsconfig: "./tsconfig.test.json",
    },
  },
})
