import { z } from "zod"

export const algoliaIntegrationSetupSchema = z.object({
  appId: z.string().min(1),
  adminApiKey: z.string().min(1),
  accessToken: z.string(),
  host: z.union([z.string(), z.literal("eu-west"), z.literal("us-east")]),
})

export type AlgoliaIntegrationSetup = z.TypeOf<
  typeof algoliaIntegrationSetupSchema
>
