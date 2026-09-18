import { defineConfig } from "@hey-api/openapi-ts"

// `@hey-api/transformers` is deliberately absent. Enabling it makes the
// typescript plugin type `date-time` as `Date` and `int64` as `bigint` (the
// `bigInt` option defaults to true) while nothing wires the transformers into
// the SDK, so the declared types would contradict the runtime values.
//
// The local `generate-readme` plugin is left out pending a rewrite; it targets
// the pre-0.7x plugin API and fails on 0.99 with "this.handler is not a function".
//
// The `zod` plugin is left out too. This package has one operation over five
// flat fields, and its main consumer is `@epcc-sdk/sdks-runtime`, which must
// stay free of peer dependencies.
export default defineConfig({
  input: "../specs/authentication.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
  plugins: [
    { name: "@hey-api/client-fetch" },
    { name: "@hey-api/typescript" },
    { name: "@hey-api/sdk" },
  ],
})
