import { checkGateway } from "@elasticpath/composable-common"
import { setupManualPaymentGateway } from "../util/setup-epcc-manual-gateway"
import { Moltin } from "@moltin/sdk"
import { ListrRendererFactory, ListrTaskWrapper } from "listr2"

export type ManualTasksContext = {
  manualGatewaySetup?: boolean
  client: Moltin
  workspaceRoot: string
}

export function createManualTasks<TContext extends ManualTasksContext>(
  _ctx: TContext,
  task: ListrTaskWrapper<TContext, ListrRendererFactory, ListrRendererFactory>,
) {
  return task.newListr((parent) => [
    {
      title: "Checking if Manual gateway is already setup",
      task: async (taskCtx, currentTask) => {
        const checkGatewayResult = await checkGateway(taskCtx.client, "manual")

        if (checkGatewayResult.success) {
          currentTask.skip("Manual was already setup.")
          parent.title = "Manual gateway was already setup"
          taskCtx.manualGatewaySetup = true
        } else {
          currentTask.title = "Manual gateway is not setup"
        }
      },
    },
    {
      title: "Setting up Manual gateway",
      skip: (taskCtx): boolean => !!taskCtx.manualGatewaySetup,
      task: async (taskCtx) => {
        const result = await setupManualPaymentGateway(taskCtx.client)

        if (!result.success) {
          throw new Error(`Failed to setup Manual - ${result.error.message}`)
        }
      },
    },
  ])
}
