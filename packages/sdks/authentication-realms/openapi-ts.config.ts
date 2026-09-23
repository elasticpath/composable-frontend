import { defineConfig } from "@hey-api/openapi-ts"

// `@hey-api/transformers` is deliberately absent. Enabling it makes the
// typescript plugin type `date-time` as `Date` while nothing wires the
// transformers into the SDK, so the types would contradict the runtime values.
// The transformers it emits for this spec are also wrong: each resource
// collapses to `.attributes`.
//
// The local `generate-readme` plugin is left out pending a rewrite; it targets
// the pre-0.7x plugin API and fails on 0.99 with "this.handler is not a function".
export default defineConfig({
  // The bundle, not the spec: it carries the shape corrections in overrides/.
  input: "../specs/bundled/authentication-realms_standalone.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
  plugins: [
    { name: "@hey-api/client-fetch" },
    { name: "@hey-api/typescript" },
    { name: "@hey-api/sdk" },
    { compatibilityVersion: 3, name: "zod" },
  ],
})
