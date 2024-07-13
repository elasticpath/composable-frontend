import { z } from "zod"
import { epccErrorResponseSchema } from "../epcc-error-schema"

export const credentialsSchema = z.object({
  access_token: z.string(),
  token_type: z.literal("Bearer"),
  expires_in: z.number(),
  expires: z.number(),
  refresh_token: z.string(),
  identifier: z.literal("password"),
})

export const credentialsResponseSchema = z.union([
  credentialsSchema,
  epccErrorResponseSchema,
])

export type CredentialsResponse = z.infer<typeof credentialsResponseSchema>

export type Credentials = z.infer<typeof credentialsSchema>
