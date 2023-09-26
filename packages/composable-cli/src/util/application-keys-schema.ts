import { z } from "zod"
import { epccErrorResponseSchema } from "../lib/epcc-error-schema"

export const applicationKeyWithSecretSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("application_key"),
  client_id: z.string(),
  client_secret: z.string(),
  reserved_rate_limit: z.number(),
})

export type ApplicationWithSecretKey = z.infer<
  typeof applicationKeyWithSecretSchema
>

export const createApplicationKeySuccessResponseSchema = z.object({
  data: applicationKeyWithSecretSchema,
})

export const createApplicationKeyResponseSchema = z.union([
  createApplicationKeySuccessResponseSchema,
  epccErrorResponseSchema,
])

export type CreateApplicationKeyResponse = z.infer<
  typeof createApplicationKeyResponseSchema
>
