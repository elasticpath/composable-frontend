import { z } from "zod"
import { epccErrorResponseSchema } from "../epcc-error-schema"

export const releaseSchema = z.object({
  id: z.string(),
  type: z.literal("catalog-release"),
  attributes: z.object({
    catalog_id: z.string(),
    description: z.string().optional(),
    name: z.string(),
  }),
  meta: z.object({
    is_full_delta: z.boolean(),
    is_full_publish: z.boolean(),
    release_status: z.union([z.literal("PENDING"), z.literal("PUBLISHED"), z.literal("FAILED")]),
  })
})

export const createReleaseSuccessResponseSchema = z.object({
  data: releaseSchema,
})

export const createReleaseResponseSchema = z.union([
  createReleaseSuccessResponseSchema,
  epccErrorResponseSchema,
])

export type CreateReleaseResponse = z.infer<typeof createReleaseResponseSchema>

export type CreateReleaseSuccessResponse = z.infer<
  typeof createReleaseSuccessResponseSchema
>

export type Release = z.infer<typeof releaseSchema>