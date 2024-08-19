import { switchUserStore } from "../../../util/build-store-prompts"
import {
  createUrqlClient,
  DeployedInstanceData,
  didRequestFail,
  doesIntegrationInstanceExist,
  getUserInfo,
  Instance,
  integrationAuthToken,
  resolveRegion,
} from "@elasticpath/composable-common"
import { ListrRendererFactory, ListrTask } from "listr2"
import { StoreCatalog } from "../../../lib/catalog/catalog-schema"
import fetch from "node-fetch"
import { ComposableRc } from "../../../lib/composable-rc-schema"
import { KlevuIntegrationSetup } from "../klevu/utility/integration-hub/setup-klevu-schema"
import { UserStore } from "../../../lib/stores/stores-schema"
import { Region } from "../../../lib/stores/region-schema"

export function createSwitchingToActiveStoreTask(): ComposerListrTask<
  IntegrationTaskContext,
  ListrRendererFactory,
  ListrRendererFactory
> {
  return {
    title: "Switching to active store",
    task: async (ctx) => {
      if (!ctx.config) {
        throw new Error("No config on context")
      }

      // Switch to the active store to make sure all access token operations are working against the correct store
      const switchStoreResult = await switchUserStore(
        ctx.requester,
        ctx.config.activeStore.id,
      )

      if (!switchStoreResult.success) {
        throw Error(
          `Failed to switch to active store - ${switchStoreResult.error.message}`,
        )
      }
    },
  }
}

export function getIntegrationHubAuthTokenTask(): ComposerListrTask<
  IntegrationTaskContext,
  ListrRendererFactory,
  ListrRendererFactory
> {
  return {
    title: "Get the integration hub auth token from Elastic Path",
    task: async (ctx) => {
      if (!ctx.config) {
        throw new Error("No config on context")
      }

      /**
       * Get the prismatic auth token from EPCC
       */
      const tokenResp = await integrationAuthToken(
        ctx.sourceInput.host,
        ctx.config.token,
      )

      if (didRequestFail(tokenResp)) {
        throw new Error(
          `Failed to get integration hub auth token - ${tokenResp.error.message}`,
        )
      }

      ctx.ihToken = tokenResp.data.jwtToken
    },
  }
}

export function createCreateUrqlClientTask({
  unsubscribe,
}: {
  unsubscribe: (() => void)[]
}): ComposerListrTask<
  IntegrationTaskContext,
  ListrRendererFactory,
  ListrRendererFactory
> {
  return {
    title: "Create Urql client",
    task: async (ctx) => {
      if (!ctx.ihToken) {
        throw new Error(
          "Integration hub auth token is missing failed to setup algolia integration",
        )
      }

      if (!ctx.sourceInput) {
        throw new Error("No source input on context")
      }

      const region = resolveRegion(ctx.sourceInput.host)

      const customerUrqlClient = createUrqlClient(ctx.ihToken, region)
      const { unsubscribe: debugUnsubscribe } =
        customerUrqlClient.subscribeToDebugTarget!((event) => {
          if (event.source === "dedupExchange") return
          const message = `[GraphQL client event][${event.type}][${event.operation.kind}][${event.operation.context.url}] ${event.message}`
          if (ctx.urqlDebugLogs) {
            ctx.urqlDebugLogs.push(message)
          } else {
            ctx.urqlDebugLogs = [message]
          }
        })
      unsubscribe = [...unsubscribe, debugUnsubscribe]

      ctx.customerUrqlClient = customerUrqlClient
    },
  }
}

export function createCheckIfInstanceExistsTask({
  integrationName,
}: {
  integrationName: string
}): ComposerListrTask<
  IntegrationTaskContext,
  ListrRendererFactory,
  ListrRendererFactory
> {
  return {
    title: "Check if instance exists on Elastic Path store",
    task: async (ctx, currentTask) => {
      const { customerId, customerUrqlClient } = ctx
      if (!customerUrqlClient) {
        throw new Error(
          "Urql client is missing failed to setup klevu integration",
        )
      }

      if (!customerId) {
        throw new Error(
          "Customer id is missing failed to setup klevu integration",
        )
      }

      /**
       * Check if instance exists on epcc store
       */
      const doesExist = await doesIntegrationInstanceExist(
        customerUrqlClient,
        customerId,
        integrationName,
      )

      if (doesExist) {
        currentTask.output = `${integrationName} integration instance already exists.`
        ctx.instanceExists = true
      }
    },
    rendererOptions: {
      persistentOutput: true,
    },
  }
}

export function getCustomerInfoTask(): ComposerListrTask<
  IntegrationTaskContext,
  ListrRendererFactory,
  ListrRendererFactory
> {
  return {
    title: "Get the user info for the customer",
    rendererOptions: {
      persistentOutput: true,
    },
    task: async (ctx, currentTask) => {
      if (!ctx.customerUrqlClient) {
        throw new Error(
          "Urql client is missing failed to setup algolia integration",
        )
      }
      /**
       * Get the user info for the customer
       */
      const userInfo = await getUserInfo(ctx.customerUrqlClient)

      if (didRequestFail(userInfo)) {
        throw new Error(`Failed to get user info - ${userInfo.error.message}`)
      }

      const customerId = userInfo.data.customer?.id

      if (customerId === undefined) {
        throw new Error("Failed to get customer id from user info")
      }

      currentTask.output = `Got customer id ${customerId}`
      ctx.customerId = customerId
    },
  }
}

export type IntegrationTaskContext = {
  catalog?: StoreCatalog
  requester: typeof fetch
  workspaceRoot: string
  composableRc?: ComposableRc
  sourceInput: KlevuIntegrationSetup
  ihToken?: string
  customerUrqlClient?: ReturnType<typeof createUrqlClient>
  customerId?: string
  createdCredentials?: {
    clientId: string
    clientSecret: string
  }
  createdInstance?: Instance
  deployedResult?: DeployedInstanceData
  instanceExists?: boolean
  urqlDebugLogs?: Array<string>
  config?: {
    activeStore: UserStore
    apiUrl: string
    token: string
    region: Region
  }
}

export type ComposerListrTask<
  Ctx extends IntegrationTaskContext,
  Renderer extends ListrRendererFactory,
  FallbackRenderer extends ListrRendererFactory,
> = ListrTask<Ctx, Renderer, FallbackRenderer>
