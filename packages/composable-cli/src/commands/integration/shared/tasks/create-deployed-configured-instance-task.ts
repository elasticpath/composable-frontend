import { ComposerListrTask, IntegrationTaskContext } from "./composer-tasks"
import { ListrRendererFactory } from "listr2"
import {
  deployIntegrationInstance,
  didRequestFail,
} from "@elasticpath/composable-common"

export function createDeployedConfiguredInstanceTask<
  TIntegrationTaskContext extends IntegrationTaskContext,
>(): ComposerListrTask<
  TIntegrationTaskContext,
  ListrRendererFactory,
  ListrRendererFactory
> {
  return {
    title: "Deploy the configured instance",
    task: async (ctx, currentTask) => {
      const { customerUrqlClient, createdInstance } = ctx

      if (!customerUrqlClient) {
        throw new Error(
          "Urql client is missing failed to setup algolia integration",
        )
      }

      if (!createdInstance) {
        throw new Error(
          "Created instance is missing failed to setup algolia integration",
        )
      }

      /**
       * Deploy the configured instance
       */
      const deployResult = await deployIntegrationInstance(customerUrqlClient, {
        instanceId: createdInstance.id,
      })

      if (didRequestFail(deployResult)) {
        throw new Error(
          `Failed to deploy integration instance - ${deployResult.error.message}`,
        )
      }

      currentTask.output = `Deployed ${deployResult.data.instance?.name} integration instance successfully for customer ${deployResult.data.instance?.customer.id}`

      ctx.deployedResult = deployResult.data
    },
  }
}
