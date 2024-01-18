import type { Moltin } from "@moltin/sdk"
import { AlgoliaIntegrationSetup } from "../../../integration/algolia/utility/integration-hub/setup-algolia-schema"
import { UserStore } from "../../../../lib/stores/stores-schema"
import { Region } from "../../../../lib/stores/region-schema"
import fetch from "node-fetch"

export type D2CSetupTaskContext = {
  client: Moltin
  workspaceRoot: string
  manualGatewaySetup?: boolean
  epPaymentGatewaySetup?: boolean
  accountId?: string
  publishableKey?: string
  sourceInput?: AlgoliaIntegrationSetup
  config?: {
    activeStore: UserStore
    apiUrl: string
    token: string
    region: Region
  }
  requester: typeof fetch
  skipGit?: boolean
  skipConfig?: boolean
}
