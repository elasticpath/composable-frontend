import { z } from "zod"
import { epccErrorResponseSchema } from "../epcc-error-schema"

export const storeCatalogSchema = z.object({
  attributes: z.object({
    name: z.string(),
  }),
  id: z.string(),
  type: z.literal("catalog")
})

export const storeCatalogsSuccessResponseSchema = z.object({
  data: z.array(storeCatalogSchema),
})

export const storeCatalogsResponseSchema = z.union([
  storeCatalogsSuccessResponseSchema,
  epccErrorResponseSchema,
])

export type StoreCatalogsResponse = z.infer<typeof storeCatalogsResponseSchema>

export type StoreCatalogsSuccessResponse = z.infer<
  typeof storeCatalogsSuccessResponseSchema
>

export type StoreCatalog = z.infer<typeof storeCatalogSchema>