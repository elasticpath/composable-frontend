import { describe, expect, it } from "vitest"
import { resolveEpccBaseUrl } from "./resolve-epcc-url"

describe("resolve-epcc-url", () => {
  it("resolveEpccBaseUrl given eu-west should return correct base url", () => {
    expect(resolveEpccBaseUrl("api.moltin.com")).toEqual(
      "https://api.moltin.com"
    )
  })

  it("resolveEpccBaseUrl given us-east should return correct base url", () => {
    expect(resolveEpccBaseUrl("useast.api.elasticpath.com")).toEqual(
      "https://useast.api.elasticpath.com"
    )
  })

  it("resolveEpccBaseUrl given specific string should return correct base url", () => {
    expect(resolveEpccBaseUrl("my-host.com")).toEqual("https://my-host.com")
  })
})
