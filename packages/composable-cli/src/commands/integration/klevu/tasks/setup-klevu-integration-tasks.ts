import { ListrTaskWrapper, ListrRendererFactory } from "listr2"
import { KlevuIntegrationTaskContext } from "../utility/types"
import { createDedicatedApiKeyTask } from "../../shared/tasks/create-dedicated-api-key-task"
import { createPerformEpccConnectionAuthRequestTask } from "../../shared/tasks/create-perform-epcc-connection-auth"
import { createDeployedConfiguredInstanceTask } from "../../shared/tasks/create-deployed-configured-instance-task"
import {
  KLEVU_INTEGRATION_ID,
  KLEVU_INTEGRATION_NAME,
  resolveRegion,
} from "@elasticpath/composable-common"
import { createInstanceTask } from "../../shared/tasks/create-instance-task"

export async function setupKlevuIntegrationTasks(
  ctx: KlevuIntegrationTaskContext,
  taskWrapper: ListrTaskWrapper<
    KlevuIntegrationTaskContext,
    ListrRendererFactory,
    ListrRendererFactory
  >,
) {
  const { host: epccHost } = ctx.sourceInput
  const customerId = ctx.customerId
  const region = resolveRegion(epccHost)

  if (!customerId) {
    throw new Error(
      "Customer ID is missing failed to setup Algolia integration",
    )
  }

  const configVariables = [
    {
      key: "Base Product URL",
      value: "https://www.example.com/products",
    },
    {
      key: "Base Category URL",
      value: "https://www.example.com/category",
    },
  ]

  return taskWrapper.newListr(
    [
      createDedicatedApiKeyTask<KlevuIntegrationTaskContext>({ name: "klevu" }),
      createInstanceTask<KlevuIntegrationTaskContext>({
        vars: {
          integrationId: KLEVU_INTEGRATION_ID[region],
          customerId,
          name: KLEVU_INTEGRATION_NAME,
          description: "Klevu Integration",
          configVariables,
        },
      }),
      createPerformEpccConnectionAuthRequestTask<KlevuIntegrationTaskContext>(),
      createDeployedConfiguredInstanceTask<KlevuIntegrationTaskContext>(),
    ],
    {
      concurrent: false,
      exitOnError: true,
    },
  )
}
