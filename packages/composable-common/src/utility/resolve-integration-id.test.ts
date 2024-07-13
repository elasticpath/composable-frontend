import { describe, expect, it } from "vitest"
import { resolveIntegrationId } from "./resolve-integration-id"
import { ALGOLIA_INTEGRATION_ID } from "../integration-hub"

describe("resolve-integration-id", () => {
  it("resolveIntegrationId given eu-west should return correct integration id", () => {
    expect(resolveIntegrationId("eu-west")).toEqual(
      ALGOLIA_INTEGRATION_ID["eu-west"]
    )
  })

  it("resolveIntegrationId given us-east should return correct integration id", () => {
    expect(resolveIntegrationId("us-east")).toEqual(
      ALGOLIA_INTEGRATION_ID["us-east"]
    )
  })

  it("resolveIntegrationId given unknown region should return correct integration id", () => {
    expect(resolveIntegrationId("unknown")).toEqual(
      ALGOLIA_INTEGRATION_ID["unknown"]
    )
  })
})
