import { gateway, MemoryStorageFactory } from "@moltin/sdk"
import { it, describe, expect } from "vitest"
import { checkGateway } from "./check-gateway"

const client = gateway({
  client_id: "123",
  client_secret: "456",
  host: "mock-host.com",
  storage: new MemoryStorageFactory(),
})

describe("check-gateway", () => {
  it("checkGateway should give success response when gateway is active", async () => {
    expect(await checkGateway(client, "manual")).toEqual({
      success: true,
      data: {
        enabled: true,
        name: "Manual",
        slug: "manual",
        type: "gateway",
      },
    })
  })

  it("checkGateway should give failure response when gateway is not enabled", async () => {
    expect(await checkGateway(client, "elastic_path_payments_stripe")).toEqual({
      success: false,
      error: new Error(`elastic_path_payments_stripe gateway is not enabled`),
    })
  })
})
