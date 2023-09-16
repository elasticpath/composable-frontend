import { z } from "zod"
import { epccErrorResponseSchema } from "./epcc-error-schema"

/**
 * User profile types
 */
const epccUserProfileSuccessResponseSchema = z.object({
  data: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    type: z.literal("user_profile"),
  }),
})

export type EpccUserProfileSuccessResponse = z.infer<
  typeof epccUserProfileSuccessResponseSchema
>

export const epccUserProfileResponseSchema = z.union([
  epccUserProfileSuccessResponseSchema,
  epccErrorResponseSchema,
])

export type EPCCUserProfileResponse = z.infer<
  typeof epccUserProfileResponseSchema
>

export type EPCCUserProfileSuccessResponse = z.infer<
  typeof epccUserProfileSuccessResponseSchema
>
