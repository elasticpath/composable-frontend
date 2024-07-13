import { describe, expect, it, expectTypeOf } from "vitest"
import {
  _getSystemAccessToken,
  getRefreshToken,
  IHEnvContext,
} from "./get-system-access-token"
import fetch from "node-fetch"

const mockEnvContext: IHEnvContext = {
  IH_INTEGRATION_SYSTEM_REFRESH_TOKEN: "mock-integration-token",
  IH_STAGING_SYSTEM_REFRESH_TOKEN: "mock-staging-token",
  IH_PROD_EU_SYSTEM_REFRESH_TOKEN: "mock-prod-eu-token",
  IH_PROD_US_SYSTEM_REFRESH_TOKEN: "mock-prod-us-token",
  "prod-eu_host": "https://mock-prod-eu-host.com",
  "prod-us_host": "https://mock-prod-us-host.com",
  integration_host: "https://mock-integration-host.com",
  staging_host: "https://mock-staging-host.com",
  requester: fetch,
} as const

describe("get-system-access-token", () => {
  it("getRefreshToken given prod-eu externalId should return correct key", () => {
    expect(
      getRefreshToken(
        "store_prod-eu_f91aa260-4f72-483f-8c65-9bc65e4b4199_org_51b27634-a8d2-4866-9ea5-f0a7ce57f50e",
        mockEnvContext,
      ),
    ).toEqual({ success: true, token: "mock-prod-eu-token", env: "prod-eu" })
  })

  it("getRefreshToken given prod-us externalId should return correct key", () => {
    expect(
      getRefreshToken(
        "store_prod-us_f91aa260-4f72-483f-8c65-9bc65e4b4199_org_51b27634-a8d2-4866-9ea5-f0a7ce57f50e",
        mockEnvContext,
      ),
    ).toEqual({ success: true, token: "mock-prod-us-token", env: "prod-us" })
  })

  it("getRefreshToken given integration externalId should return correct key", () => {
    expect(
      getRefreshToken(
        "store_integration_f91aa260-4f72-483f-8c65-9bc65e4b4199_org_51b27634-a8d2-4866-9ea5-f0a7ce57f50e",
        mockEnvContext,
      ),
    ).toEqual({
      success: true,
      token: "mock-integration-token",
      env: "integration",
    })
  })

  it("getRefreshToken given staging externalId should return correct key", () => {
    expect(
      getRefreshToken(
        "store_staging_f91aa260-4f72-483f-8c65-9bc65e4b4199_org_51b27634-a8d2-4866-9ea5-f0a7ce57f50e",
        mockEnvContext,
      ),
    ).toEqual({ success: true, token: "mock-staging-token", env: "staging" })
  })

  it("getRefreshToken should fail when given invalid environment", () => {
    expectTypeOf(
      getRefreshToken(
        "store_invalid-env_f91aa260-4f72-483f-8c65-9bc65e4b4199_org_51b27634-a8d2-4866-9ea5-f0a7ce57f50e",
        mockEnvContext,
      ),
    ).toEqualTypeOf<{ success: false; error: Error }>
  })

  it("_getSystemAccessToken should return an access token when given valid externalId", async () => {
    expect(
      await _getSystemAccessToken(mockEnvContext)(
        "store_prod-eu_f91aa260-4f72-483f-8c65-9bc65e4b4199_org_51b27634-a8d2-4866-9ea5-f0a7ce57f50e",
      ),
    ).toEqual({
      success: true,
      token: "this-is-a-test-access-token",
    })
  })
})
