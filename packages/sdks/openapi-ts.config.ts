import { defineConfig } from "@hey-api/openapi-ts"

export default defineConfig({
  input: "./specs/pim.yaml",
  output: "src/client",
})
