import { describe, it, expect } from "vitest"
import { createRequire } from "node:module"

// The spec plugins are CommonJS and live outside this package's src.
const require = createRequire(import.meta.url)
const PrefixPaths = require("../../../specs/plugins/preprocessors/prefix-paths.js")

function run(
  paths: Record<string, unknown>,
  props: Record<string, unknown> = {},
) {
  PrefixPaths(props).Paths.leave(paths)
  return paths
}

describe("prefix-paths", () => {
  it("prefixes an unprefixed path", () => {
    const paths = { "/carts": { get: { operationId: "getCarts" } } }
    run(paths)
    expect(Object.keys(paths)).toEqual(["/v2/carts"])
  })

  it("leaves an already-prefixed path alone", () => {
    const paths = { "/v2/carts": { get: { operationId: "getCarts" } } }
    run(paths)
    expect(Object.keys(paths)).toEqual(["/v2/carts"])
  })

  it("leaves a path equal to the prefix alone", () => {
    const paths = { "/v2": { get: { operationId: "getRoot" } } }
    run(paths)
    expect(Object.keys(paths)).toEqual(["/v2"])
  })

  it("does not treat a path that merely starts with the prefix text as prefixed", () => {
    const paths = { "/v2beta/carts": { get: { operationId: "getCarts" } } }
    run(paths)
    expect(Object.keys(paths)).toEqual(["/v2/v2beta/carts"])
  })

  it("running twice equals running once", () => {
    const once = run({ "/carts": { get: {} }, "/v2/orders": { get: {} } })
    const twice = run({ "/carts": { get: {} }, "/v2/orders": { get: {} } })
    run(twice)
    expect(Object.keys(twice).sort()).toEqual(Object.keys(once).sort())
    expect(Object.keys(twice).sort()).toEqual(["/v2/carts", "/v2/orders"])
  })

  it("honours a configured prefix", () => {
    const paths = { "/carts": { get: {} }, "/pcm/products": { get: {} } }
    run(paths, { prefix: "/pcm" })
    expect(Object.keys(paths).sort()).toEqual(["/pcm/carts", "/pcm/products"])
  })

  it("keeps the path item object identity", () => {
    const item = { get: { operationId: "getCarts" } }
    const paths: Record<string, unknown> = { "/carts": item }
    run(paths)
    expect(paths["/v2/carts"]).toBe(item)
  })
})
