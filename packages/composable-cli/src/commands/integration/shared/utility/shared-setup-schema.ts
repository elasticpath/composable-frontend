import { z } from "zod"

export const sharedIntegrationSetupSchema = z.object({
  accessToken: z.string(),
  host: z.union([z.string(), z.literal("eu-west"), z.literal("us-east")]),
})

export type SharedIntegrationSetup = z.TypeOf<
  typeof sharedIntegrationSetupSchema
>
