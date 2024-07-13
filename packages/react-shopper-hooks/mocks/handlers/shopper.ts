import { rest } from "msw"
import { fixtures } from "../data"

export const shopperHandlers = [
  rest.post("https://shopper-mock.com/oauth/access_token", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        identifier: "implicit",
        token_type: "Bearer",
        expires_in: 3600,
        expires: 9999999999,
        access_token: "mock-access-token-123",
      }),
    )
  }),
  rest.get(
    "https://shopper-mock.com/v2/carts/:cartId/items",
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(fixtures.get("cart")))
    },
  ),
]
