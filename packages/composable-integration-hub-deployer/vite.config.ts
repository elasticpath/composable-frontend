/// <reference types="vitest" />

// Configure Vitest (https://vitest.dev/config/)

import { defineConfig } from "vite"

export default defineConfig({
  test: {
    setupFiles: ["./netlify/msw-test/msw-setup.ts"],
  },
})
