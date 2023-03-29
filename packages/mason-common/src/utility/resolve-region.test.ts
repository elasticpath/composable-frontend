import { describe, expect, it } from "vitest"
import { resolveRegion } from "./resolve-region"

describe("resolve-region", () => {
  it("resolveRegion given api.moltin.com should return correct region", () => {
    expect(resolveRegion("api.moltin.com")).toEqual("eu-west")
  })

  it("resolveRegion given useast.api.elasticpath.com should return correct region", () => {
    expect(resolveRegion("useast.api.elasticpath.com")).toEqual("us-east")
  })

  it("resolveRegion given specific string should return correct region", () => {
    expect(resolveRegion("other")).toEqual("unknown")
  })
})
