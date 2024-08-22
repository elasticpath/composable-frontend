import { errorMessages } from "./error-messages"
import { KlevuIntegrationSetup } from "./integration-hub/setup-klevu-schema"
import { IntegrationTaskContext } from "../../shared/tasks/composer-tasks"

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

export type KlevuIntegrationTaskContext = IntegrationTaskContext & {
  sourceInput: KlevuIntegrationSetup
}
