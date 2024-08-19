import { z } from "zod"

export const klevuIntegrationSetupSchema = z.object({
  apiKey: z.string().min(1),
  searchUrl: z.string().min(1),
  accessToken: z.string(),
  host: z.union([z.string(), z.literal("eu-west"), z.literal("us-east")]),
})

export type KlevuIntegrationSetup = z.TypeOf<typeof klevuIntegrationSetupSchema>
