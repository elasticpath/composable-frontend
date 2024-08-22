import { z } from "zod"
import { sharedIntegrationSetupSchema } from "../../../shared/utility/shared-setup-schema"

export const klevuIntegrationSetupSchema = sharedIntegrationSetupSchema.merge(
  z.object({
    apiKey: z.string().min(1),
    searchUrl: z.string().min(1),
  }),
)

export type KlevuIntegrationSetup = z.TypeOf<typeof klevuIntegrationSetupSchema>
