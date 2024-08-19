import { errorMessages } from "./error-messages"
import fetch from "node-fetch"
import {
  createUrqlClient,
  DeployedInstanceData,
  Instance,
} from "@elasticpath/composable-common"
import { StoreCatalog } from "../../../../lib/catalog/catalog-schema"
import { ComposableRc } from "../../../../lib/composable-rc-schema"
import { KlevuIntegrationSetup } from "./integration-hub/setup-klevu-schema"
import { UserStore } from "../../../../lib/stores/stores-schema"
import { Region } from "../../../../lib/stores/region-schema"

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

export type KlevuIntegrationTaskContext = {
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
