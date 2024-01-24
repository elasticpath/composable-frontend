import { errorMessages } from "./error-messages"
import { StoreCatalog } from "../../../../../lib/catalog/catalog-schema"
import fetch from "node-fetch"
import { AlgoliaIntegrationSetup } from "../integration-hub/setup-algolia-schema"
import {
  createUrqlClient,
  DeployedInstanceData,
  Instance,
} from "@elasticpath/composable-common"
import { UserStore } from "../../../../../lib/stores/stores-schema"
import { Region } from "../../../../../lib/stores/region-schema"
import { ComposableRc } from "../../../../../lib/composable-rc-schema"

export type SetupResponse = SetupResponseSuccess | SetupResponseFailure

export type SetupResponseErrorCode = keyof typeof errorMessages

export interface SetupResponseSuccess {
  success: true
  result: any
}

export interface SetupResponseFailure {
  success: false
  code: SetupResponseErrorCode
  reason: string
  error?: Error
}

export type AlgoliaIntegrationTaskContext = {
  catalog?: StoreCatalog
  algoliaIndexName?: string
  requester: typeof fetch
  workspaceRoot: string
  composableRc?: ComposableRc
  sourceInput: AlgoliaIntegrationSetup
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
