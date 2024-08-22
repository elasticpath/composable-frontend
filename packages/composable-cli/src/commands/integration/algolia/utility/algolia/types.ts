import { errorMessages } from "./error-messages"
import { AlgoliaIntegrationSetup } from "../integration-hub/setup-algolia-schema"
import { IntegrationTaskContext } from "../../../shared/tasks/composer-tasks"

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

export type AlgoliaIntegrationTaskContext = Omit<
  IntegrationTaskContext,
  "sourceInput"
> & {
  algoliaIndexName?: string
  sourceInput: AlgoliaIntegrationSetup
}
