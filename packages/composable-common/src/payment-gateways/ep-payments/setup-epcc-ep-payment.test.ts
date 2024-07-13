import { it, describe, expect } from "vitest"
import { setupEPPaymentsPaymentGateway } from "./setup-epcc-ep-payment"
import { logging } from "@angular-devkit/core"

describe("setup-epcc-ep-payment", () => {
  it("setupEPPaymentsPaymentGateway should give success response provided the correct data", async () => {
    const logger = new logging.Logger("test")
    expect(
      await setupEPPaymentsPaymentGateway(
        {
          epccConfig: {
            clientId: "123",
            clientSecret: "456",
            host: "mock-host.com",
          },
          epPaymentsStripeAccountId: "abc",
          epPaymentsStripePublishableKey: "dfg",
        },
        logger
      )
    ).toEqual({
      success: true,
      data: {
        enabled: true,
        name: "Elastic Path Payments powered by Stripe",
        slug: "elastic_path_payments_stripe",
        stripe_account: "abc",
        test: true,
        type: "gateway",
      },
    })
  })
})
