import { z } from "zod"

export const composableRcSchema = z.object({
  version: z.literal(1),
  cli: z
    .object({
      packageManager: z
        .union([
          z.literal("npm"),
          z.literal("yarn"),
          z.literal("pnpm"),
          z.literal("bun"),
        ])
        .optional(),
    })
    .optional(),
})

export type ComposableRc = z.infer<typeof composableRcSchema>
