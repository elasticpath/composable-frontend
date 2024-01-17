import { errorMessages } from "./error-messages"
import { StoreCatalog } from "../../../../../lib/catalog/catalog-schema"
import fetch from "node-fetch"

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
}
