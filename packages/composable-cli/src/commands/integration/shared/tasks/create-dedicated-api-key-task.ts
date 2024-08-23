import { ComposerListrTask, IntegrationTaskContext } from "./composer-tasks"
import { ListrRendererFactory } from "listr2"
import { createApplicationKeys } from "../../../../util/create-client-secret"
import { didRequestFail } from "@elasticpath/composable-common"

export function createDedicatedApiKeyTask<
  TIntegrationTaskContext extends IntegrationTaskContext,
>({
  name,
}: {
  name: string
}): ComposerListrTask<
  TIntegrationTaskContext,
  ListrRendererFactory,
  ListrRendererFactory
> {
  return {
    title: "Create a dedicated api key for the integration",
    task: async (ctx) => {
      /**
       * Create a dedicated api key for the integration
       */
      const apiKeyResp = await createApplicationKeys(
        ctx.requester,
        `${name}-integration-${new Date().toISOString()}`,
      )

      if (didRequestFail(apiKeyResp)) {
        throw new Error(
          `Failed to create api key - ${apiKeyResp.error.message}`,
        )
      }

      const { client_id, client_secret } = apiKeyResp.data

      if (!client_secret) {
        throw new Error("Failed to get client secret from api key response")
      }

      ctx.createdCredentials = {
        clientId: client_id,
        clientSecret: client_secret,
      }
    },
  }
}
