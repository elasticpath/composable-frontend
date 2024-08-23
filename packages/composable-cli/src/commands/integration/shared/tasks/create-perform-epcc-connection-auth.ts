import { ComposerListrTask, IntegrationTaskContext } from "./composer-tasks"
import { performConnectionConfigAuthorisation } from "@elasticpath/composable-common"
import { ListrRendererFactory } from "listr2/dist"

export function createPerformEpccConnectionAuthRequestTask<
  TIntegrationTaskContext extends IntegrationTaskContext,
>(): ComposerListrTask<
  TIntegrationTaskContext,
  ListrRendererFactory,
  ListrRendererFactory
> {
  return {
    title: "Perform the EPCC connection auth request",
    task: async (ctx) => {
      const { createdInstance } = ctx

      if (!createdInstance) {
        throw new Error(
          "Created instance is missing failed to setup integration",
        )
      }

      /**
       * Perform the EPCC connection auth request
       */
      await performConnectionConfigAuthorisation(createdInstance)
    },
  }
}
