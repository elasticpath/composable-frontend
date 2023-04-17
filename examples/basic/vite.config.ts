import { defineConfig, defaultExclude } from "vitest/config";

export default defineConfig({
  test: {
    exclude: ["e2e/**/*", ...defaultExclude],
    coverage: {
      provider: "istanbul",
      all: true,
      include: ["src/**/*.ts"],
    },
  },
});
