import { rest } from "msw"
import {
  gatewaysEnabledResponse,
  updateEPPaymentGatewayResponse,
} from "./data/gateways-response"

export const epccHandlers = [
  rest.post("https://mock-host.com/oauth/access_token", (req, res, ctx) => {
    return res(
      ctx.json({
        access_token: "mock-access-token-123",
        expires_in: 9999999999,
        expires: 9999999999,
        identifier: "client_credentials",
        token_type: "Bearer",
      })
    )
  }),

  rest.get("https://mock-host.com/v2/gateways", (req, res, ctx) => {
    return res(ctx.json(gatewaysEnabledResponse))
  }),

  rest.put(
    "https://mock-host.com/v2/gateways/elastic_path_payments_stripe",
    async (req, res, ctx) => {
      const reqData = await req.json()

      return res(
        ctx.json({
          data: {
            ...updateEPPaymentGatewayResponse.data,
            stripe_account: reqData.data.stripe_account,
            test: reqData.data.test,
            enabled: reqData.data.enabled,
          },
        })
      )
    }
  ),
]
