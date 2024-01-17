import { checkGateway } from "@elasticpath/composable-common"
import { Moltin } from "@moltin/sdk"
import { ListrRendererFactory, ListrTaskWrapper } from "listr2"
import { setupEPPaymentsPaymentGateway } from "../../ep-payments/util/setup-epcc-ep-payment"
import { addToEnvFile } from "../../../../lib/devkit/add-env-variables"

export type EPPaymentTasksContext = {
  manualGatewaySetup?: boolean
  epPaymentGatewaySetup?: boolean
  client: Moltin
  workspaceRoot: string
  accountId?: string
  publishableKey?: string
}

export function createEPPaymentTasks(
  _ctx: EPPaymentTasksContext,
  task: ListrTaskWrapper<
    EPPaymentTasksContext,
    ListrRendererFactory,
    ListrRendererFactory
  >,
) {
  return task.newListr((parent) => [
    {
      title: "Check if EP Payment gateway is already setup",
      task: async (taskCtx, currentTask) => {
        const checkGatewayResult = await checkGateway(
          taskCtx.client,
          "elastic_path_payments_stripe",
        )

        if (checkGatewayResult.success) {
          taskCtx.epPaymentGatewaySetup = true
          currentTask.skip("EP Payment gateway was already setup.")
          parent.title = "EP Payment gateway was already setup"
        }
      },
    },
    {
      title: "Setting up EP Payment gateway",
      skip: (taskCtx): boolean => !!taskCtx.epPaymentGatewaySetup,
      task: async (taskCtx) => {
        const { accountId, publishableKey } = taskCtx

        if (!accountId) {
          throw new Error("EP Payment gateway setup requires accountId")
        }
        if (!publishableKey) {
          throw new Error("EP Payment gateway setup requires publishableKey")
        }

        const result = await setupEPPaymentsPaymentGateway(
          {
            epPaymentsStripeAccountId: accountId,
            epPaymentsStripePublishableKey: publishableKey,
          },
          taskCtx.client,
        )

        if (!result.success) {
          throw new Error(
            `Failed to setup EP Payments - ${result.error.message}`,
          )
        }
      },
    },
    {
      title: "Update .env.local file",
      task: async (taskCtx) => {
        const { accountId, publishableKey } = taskCtx

        if (!accountId) {
          throw new Error("EP Payment gateway setup requires accountId")
        }
        if (!publishableKey) {
          throw new Error("EP Payment gateway setup requires publishableKey")
        }

        await addToEnvFile(taskCtx.workspaceRoot, ".env.local", {
          NEXT_PUBLIC_STRIPE_ACCOUNT_ID: accountId,
          NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: publishableKey,
        })
      },
    },
  ])
}
