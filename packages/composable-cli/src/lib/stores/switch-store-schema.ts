import { z } from "zod"
import { epccErrorResponseSchema } from "../epcc-error-schema"

export const userSwitchStoreSuccessResponseSchema = z.object({
  data: z.object({
    title: z.string(),
    status: z.literal(200),
  }),
})

export const userSwitchStoreResponseSchema = z.union([
  userSwitchStoreSuccessResponseSchema,
  epccErrorResponseSchema,
])

export type UserSwitchStoreResponse = z.infer<
  typeof userSwitchStoreResponseSchema
>
