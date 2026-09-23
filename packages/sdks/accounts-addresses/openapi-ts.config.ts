import { defineConfig } from "@hey-api/openapi-ts"

// `@hey-api/transformers` is deliberately absent. Enabling it makes the
// typescript plugin type `date-time` as `Date` and `int64` as `bigint` while
// nothing wires the transformers into the SDK, so the types would contradict the
// runtime values. The transformers it emits for this spec are also wrong: each
// resource collapses to `.attributes`.
//
// The local `generate-readme` plugin is left out pending a rewrite; it targets
// the pre-0.7x plugin API and fails on 0.99 with "this.handler is not a function".
export default defineConfig({
  input: "../specs/account-addresses.yaml",
  output: { path: "src/client", postProcess: ["prettier"] },
  plugins: [
    // `baseUrl` picks EU West out of the specification's `servers` list, which leads
    // with US East. Every other package on this generator defaults to EU West, so a
    // consumer installing two of them and configuring neither would otherwise talk to
    // two regions with no warning and no type error. Setting it here rather than
    // reordering the specification keeps the working spec byte-identical to canonical,
    // so `scripts/spec-sync` keeps refreshing it.
    { baseUrl: "https://euwest.api.elasticpath.com", name: "@hey-api/client-fetch" },
    { name: "@hey-api/typescript" },
    { name: "@hey-api/sdk" },
    { compatibilityVersion: 3, name: "zod" },
  ],
})
