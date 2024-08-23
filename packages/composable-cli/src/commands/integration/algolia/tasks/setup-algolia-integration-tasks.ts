import {
  ALGOLIA_INTEGRATION_ID,
  ALGOLIA_INTEGRATION_NAME,
  createWebhookSecretKey,
  resolveEpccBaseUrl,
  resolveRegion,
} from "@elasticpath/composable-common"
import { ListrTaskWrapper, ListrRendererFactory } from "listr2"
import { AlgoliaIntegrationTaskContext } from "../utility/algolia/types"
import { createDedicatedApiKeyTask } from "../../shared/tasks/create-dedicated-api-key-task"
import { createPerformEpccConnectionAuthRequestTask } from "../../shared/tasks/create-perform-epcc-connection-auth"
import { createDeployedConfiguredInstanceTask } from "../../shared/tasks/create-deployed-configured-instance-task"
import { createInstanceTask } from "../../shared/tasks/create-instance-task"

export async function setupAlgoliaIntegrationTasks(
  ctx: AlgoliaIntegrationTaskContext,
  taskWrapper: ListrTaskWrapper<
    AlgoliaIntegrationTaskContext,
    ListrRendererFactory,
    ListrRendererFactory
  >,
) {
  const { host: epccHost, adminApiKey, appId } = ctx.sourceInput
  const customerId = ctx.customerId
  const region = resolveRegion(epccHost)

  if (!customerId) {
    throw new Error(
      "Customer ID is missing failed to setup Algolia integration",
    )
  }

  const epccBaseUrl = resolveEpccBaseUrl(epccHost)

  const configVariables = [
    {
      key: "algolia_app_id",
      value: appId,
    },
    {
      key: "algolia_admin_api_key",
      value: adminApiKey,
    },
    {
      key: "epcc_base_url",
      value: epccBaseUrl,
    },
    {
      key: "webhook_key",
      value: createWebhookSecretKey(),
    },
  ]

  return taskWrapper.newListr(
    [
      createDedicatedApiKeyTask<AlgoliaIntegrationTaskContext>({
        name: "algolia",
      }),
      createInstanceTask<AlgoliaIntegrationTaskContext>({
        vars: {
          integrationId: ALGOLIA_INTEGRATION_ID[region],
          customerId,
          name: ALGOLIA_INTEGRATION_NAME,
          description: "Algolia Integration",
          configVariables,
        },
        epComponentConnectionKeyName:
          "Elastic Path Commerce Cloud Component Connection - Shared",
      }),
      createPerformEpccConnectionAuthRequestTask<AlgoliaIntegrationTaskContext>(),
      createDeployedConfiguredInstanceTask<AlgoliaIntegrationTaskContext>(),
    ],
    {
      concurrent: false,
      exitOnError: true,
    },
  )
}
