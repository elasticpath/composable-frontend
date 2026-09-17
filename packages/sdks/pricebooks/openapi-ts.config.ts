import { defineConfig } from "@hey-api/openapi-ts"

// Generator: @hey-api/openapi-ts 0.99.0.
//
// Differences from the 0.61.2 config this replaced:
// - `experimentalParser` is gone: the IR parser is the only parser; the
//   optional top-level `parser` key holds its settings.
// - `client` is no longer a top-level key: the fetch client is a plugin and is
//   vendored into `src/client/{client,core}` (plugin `bundle` default true), so
//   the package has no runtime `@hey-api/*` dependency.
// - `@hey-api/transformers` is deliberately NOT enabled. Its presence makes the
//   typescript plugin type `date-time` as `Date` and `int64` as `bigint` while
//   nothing wires the transformers into the SDK, so the types would lie about
//   the runtime values (strings and numbers). The transformers it emits are also
//   incorrect for this spec (each resource collapses to `.attributes`).
// - `@hey-api/sdk` `validator` and `transformer` stay at their default `false`:
//   no runtime validation in the SDK.
// - `zod` plugin emits `src/client/zod.gen.ts` targeting zod v3; it is exposed
//   through the `/zod` subpath only so the main entry never imports zod.
// - The local `generate-readme` plugin (../specs/heyapi/plugins) targets the
//   pre-0.7x plugin API (`_handler`, `context.subscribe`) and fails on 0.99 with
//   "this.handler is not a function". It is left out here pending a rewrite.
export default defineConfig({
  input: "../specs/pricebooks.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
  plugins: [
    { name: "@hey-api/client-fetch" },
    { name: "@hey-api/typescript" },
    { name: "@hey-api/sdk" },
    { compatibilityVersion: 3, name: "zod" },
  ],
})
