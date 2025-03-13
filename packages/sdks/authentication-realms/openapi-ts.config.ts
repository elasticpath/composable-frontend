import { defaultPlugins, defineConfig } from "@hey-api/openapi-ts"
import { defineConfig as defineReadmeConfig } from "../specs/heyapi/plugins"

export default defineConfig({
  client: "@hey-api/client-fetch",
  experimentalParser: true,
  input: "../specs/authentication-realms.yaml",
  output: { path: "src/client", format: "prettier" },
  plugins: [
    ...defaultPlugins,
    {
      exportInlineEnums: true,
      name: "@hey-api/typescript",
    },
    {
      dates: true,
      name: "@hey-api/transformers",
    },
    defineReadmeConfig({
      name: "generate-readme",
      targetOperation: "getPasswordProfileInfo",
    }),
  ],
})
