import * as z from "zod"

export const customerJwtSchema = z.object({
  sub: z.string(),
  organization: z.string(),
  customer: z.string(),
  iat: z.number(),
  exp: z.number(),
})

export type CustomerJwt = z.TypeOf<typeof customerJwtSchema>
