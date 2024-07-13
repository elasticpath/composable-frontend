import * as z from "zod"

export const ihAccessTokenResponseSchema = z.object({
  access_token: z.string(),
  id_token: z.string(),
  scope: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
})

export type IhAccessTokenResponse = z.TypeOf<typeof ihAccessTokenResponseSchema>
