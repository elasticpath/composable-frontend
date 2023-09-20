import { z } from "zod"
import { epccErrorResponseSchema } from "../epcc-error-schema"

export const userStoreSchema = z.object({
  id: z.string(),
  name: z.string(),
  store_type: z.string(),
  type: z.literal("store"),
  ep_disabled: z.boolean(),
  meta: z.object({
    timestamps: z.object({
      created_at: z.string(),
      updated_at: z.string(),
    }),
  }),
})

export const userStoresSuccessResponseSchema = z.object({
  data: z.array(userStoreSchema),
})

export const userStoresResponseSchema = z.union([
  userStoresSuccessResponseSchema,
  epccErrorResponseSchema,
])

export type UserStoresResponse = z.infer<typeof userStoresResponseSchema>

export type UserStoresSuccessResponse = z.infer<
  typeof userStoresSuccessResponseSchema
>

export type UserStore = z.infer<typeof userStoreSchema>
