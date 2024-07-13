import { rest } from "msw"
import { IhAccessTokenResponse } from "../../lib/schema/ih-access-token-schema"

export const handlers = [
  rest.post("https://mock-*.com/auth/refresh", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json<IhAccessTokenResponse>({
        access_token: "this-is-a-test-access-token",
        id_token: "this-is-a-test-id-token",
        scope: "openid profile email offline_access",
        expires_in: 604800,
        token_type: "Bearer",
      })
    )
  }),
]
