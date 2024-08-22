import { z } from "zod"
import { sharedIntegrationSetupSchema } from "../../../shared/utility/shared-setup-schema"

export const algoliaIntegrationSetupSchema = sharedIntegrationSetupSchema.merge(
  z.object({
    appId: z.string().min(1),
    adminApiKey: z.string().min(1),
    searchApiKey: z.string().min(1),
  }),
)

export type AlgoliaIntegrationSetup = z.TypeOf<
  typeof algoliaIntegrationSetupSchema
>
