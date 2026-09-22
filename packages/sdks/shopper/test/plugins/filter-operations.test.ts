import { describe, it, expect } from "vitest"
import { createRequire } from "node:module"

// The spec plugins are CommonJS and live outside this package's src.
const require = createRequire(import.meta.url)
const FilterOperations = require("../../../specs/plugins/preprocessors/filter-operations.js")

type Paths = Record<string, Record<string, any>>

function run(paths: Paths, props: Record<string, unknown> = {}) {
  FilterOperations(props).Paths.leave(paths)
  return paths
}

const KEEP = { extensionName: "x-sdk-filter", extensionValues: ["shopper"] }

describe("filter-operations", () => {
  it("keeps an operation whose extension value matches", () => {
    const paths: Paths = {
      "/carts": { get: { operationId: "getCarts", "x-sdk-filter": "shopper" } },
    }
    run(paths, KEEP)
    expect(paths["/carts"].get.operationId).toBe("getCarts")
  })

  it("keeps an operation whose extension is an array overlapping the allowed values", () => {
    const paths: Paths = {
      "/carts": {
        get: { operationId: "getCarts", "x-sdk-filter": ["admin", "shopper"] },
      },
    }
    run(paths, KEEP)
    expect(paths["/carts"].get).toBeDefined()
  })

  it("deletes an operation with no extension", () => {
    const paths: Paths = {
      "/carts": {
        get: { operationId: "getCarts", "x-sdk-filter": "shopper" },
        post: { operationId: "createCart" },
      },
    }
    run(paths, KEEP)
    expect(paths["/carts"].post).toBeUndefined()
    expect(paths["/carts"].get).toBeDefined()
  })

  it("deletes an operation whose extension value does not match", () => {
    const paths: Paths = {
      "/carts": {
        get: { operationId: "getCarts", "x-sdk-filter": "shopper" },
        post: { operationId: "createCart", "x-sdk-filter": "admin" },
      },
    }
    run(paths, KEEP)
    expect(paths["/carts"].post).toBeUndefined()
  })

  it("deletes a path once all of its operations are removed", () => {
    const paths: Paths = {
      "/carts": { get: { operationId: "getCarts", "x-sdk-filter": "shopper" } },
      "/admin": { get: { operationId: "getAdmin", "x-sdk-filter": "admin" } },
    }
    run(paths, KEEP)
    expect(Object.keys(paths)).toEqual(["/carts"])
  })

  it("keeps an operation named in operationIds regardless of extension", () => {
    const paths: Paths = {
      "/orders": { get: { operationId: "getAnOrder" } },
      "/admin": { get: { operationId: "getAdmin", "x-sdk-filter": "admin" } },
    }
    run(paths, { ...KEEP, operationIds: ["getAnOrder"] })
    expect(paths["/orders"].get.operationId).toBe("getAnOrder")
    expect(paths["/admin"]).toBeUndefined()
  })

  it("keeps an operationIds match whose extension value is explicitly excluded", () => {
    const paths: Paths = {
      "/orders": {
        get: { operationId: "getAnOrder", "x-sdk-filter": "admin" },
      },
    }
    run(paths, { ...KEEP, operationIds: ["getAnOrder"] })
    expect(paths["/orders"].get).toBeDefined()
  })

  it("throws naming an operationId that matches nothing", () => {
    const paths: Paths = {
      "/carts": { get: { operationId: "getCarts", "x-sdk-filter": "shopper" } },
    }
    expect(() =>
      run(paths, { ...KEEP, operationIds: ["getCarts", "getSomethingGone"] }),
    ).toThrow(/getSomethingGone/)
  })

  it("names every missing operationId, not just the first", () => {
    const paths: Paths = {
      "/carts": { get: { operationId: "getCarts", "x-sdk-filter": "shopper" } },
    }
    let message = ""
    try {
      run(paths, { ...KEEP, operationIds: ["gone1", "gone2"] })
    } catch (e) {
      message = (e as Error).message
    }
    expect(message).toContain("gone1")
    expect(message).toContain("gone2")
  })

  it("behaves as a pure extension allow-list when no operationIds are configured", () => {
    const paths: Paths = {
      "/carts": {
        get: { operationId: "getCarts", "x-sdk-filter": "shopper" },
        post: { operationId: "createCart", "x-sdk-filter": "admin" },
      },
      "/admin": { get: { operationId: "getAdmin" } },
    }
    run(paths, KEEP)
    expect(Object.keys(paths)).toEqual(["/carts"])
    expect(Object.keys(paths["/carts"])).toEqual(["get"])
  })

  it("leaves non-method path item keys alone on a surviving path", () => {
    const paths: Paths = {
      "/carts/{cartID}": {
        parameters: [{ name: "cartID", in: "path" }],
        summary: "A cart",
        get: { operationId: "getACart", "x-sdk-filter": "shopper" },
      },
    }
    run(paths, KEEP)
    expect(paths["/carts/{cartID}"].parameters).toHaveLength(1)
    expect(paths["/carts/{cartID}"].summary).toBe("A cart")
  })

  it("deletes everything when nothing carries the extension", () => {
    const paths: Paths = { "/carts": { get: { operationId: "getCarts" } } }
    run(paths, KEEP)
    expect(paths).toEqual({})
  })
})
