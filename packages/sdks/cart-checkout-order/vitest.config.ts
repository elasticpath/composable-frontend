import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    include: ["**/*.{test,spec}.{js,ts}"],
    typecheck: {
      enabled: true,
      include: ["src/**/*.test-d.ts"],
      tsconfig: "./tsconfig.test.json",
    },
  },
})
