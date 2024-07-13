import { z } from "zod"

const epccErrorSchema = z.object({
  status: z.union([z.string(), z.number()]),
  title: z.string(),
  detail: z.string().optional(),
})

const epccCodeErrorSchema = z.object({
  code: z.string(),
  title: z.string(),
  detail: z.string().optional(),
})

export const epccErrorResponseSchema = z.object({
  errors: z.union([
    z.array(epccErrorSchema),
    epccErrorSchema,
    z.array(epccCodeErrorSchema),
    epccCodeErrorSchema,
  ]),
})

export type EPCCErrorResponse = z.infer<typeof epccErrorResponseSchema>
