import { it, describe, expect } from "vitest"
import { updateEpPaymentGateway } from "./update-gateway"
import { gateway, MemoryStorageFactory } from "@moltin/sdk"

describe("update-gateway", () => {
  it("updateEpPaymentGateway should give success response", async () => {
    const client = gateway({
      client_id: "123",
      client_secret: "456",
      host: "mock-host.com",
      storage: new MemoryStorageFactory(),
    })
    expect(await updateEpPaymentGateway(client, "new-account-id")).toEqual({
      success: true,
      data: {
        enabled: true,
        name: "Elastic Path Payments powered by Stripe",
        slug: "elastic_path_payments_stripe",
        stripe_account: "new-account-id",
        test: true,
        type: "gateway",
      },
    })
  })
})
