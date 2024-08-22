import { ComposerListrTask, IntegrationTaskContext } from "./composer-tasks"
import { ListrRendererFactory } from "listr2"
import {
  CreateInstanceMutationVariables,
  createIntegrationInstance,
  didRequestFail,
  resolveEpccBaseUrl,
} from "@elasticpath/composable-common"

export function createInstanceTask<
  TIntegrationTaskContext extends IntegrationTaskContext,
>({
  vars,
}: {
  vars: CreateInstanceMutationVariables
}): ComposerListrTask<
  TIntegrationTaskContext,
  ListrRendererFactory,
  ListrRendererFactory
> {
  return {
    title: `Create the ${vars.name} Integration instance`,
    task: async (ctx, currentTask) => {
      const {
        customerUrqlClient,
        config,
        sourceInput: { host },
        customerId,
      } = ctx

      if (!customerUrqlClient) {
        throw new Error(
          "Urql client is missing failed to setup algolia integration",
        )
      }

      if (!config?.region) {
        throw new Error(
          `Region is missing, failed to setup ${name} integration`,
        )
      }

      if (!customerId) {
        throw new Error(
          `Customer ID is missing, failed to setup ${name} integration`,
        )
      }

      if (!ctx.createdCredentials) {
        throw new Error(
          "Created credentials are missing failed to setup Algolia integration",
        )
      }

      const { clientId, clientSecret } = ctx.createdCredentials

      const tokenUrl = `${resolveEpccBaseUrl(host)}/oauth/access_token`

      const connectionKeyValue = {
        key: "Elastic Path Commerce Cloud Component Connection - Shared",
        values: `[{"name":"clientId","type":"value","value":"${clientId}"},{"name":"tokenUrl","type":"value","value":"${tokenUrl}"},{"name":"clientSecret","type":"value","value":"${clientSecret}"}]`,
      }

      /**
       * Create the instance
       */
      const createdInstanceResponse = await createIntegrationInstance(
        customerUrqlClient,
        {
          ...vars,
          configVariables: vars.configVariables
            ? {
                ...vars.configVariables,
                ...connectionKeyValue,
              }
            : [connectionKeyValue],
        },
      )

      if (didRequestFail(createdInstanceResponse)) {
        throw new Error(
          `Failed to create integration instance - ${createdInstanceResponse.error.message}`,
        )
      }

      currentTask.output = `Created instance of ${createdInstanceResponse.data.name} integration for customer ${createdInstanceResponse.data.customer?.id}`

      ctx.createdInstance = createdInstanceResponse.data
    },
  }
}
