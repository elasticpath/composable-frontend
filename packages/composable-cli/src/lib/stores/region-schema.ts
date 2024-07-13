import { z } from "zod"

export const regionSchema = z.union([
  z.literal("us-east"),
  z.literal("eu-west"),
])

export type Region = z.infer<typeof regionSchema>
