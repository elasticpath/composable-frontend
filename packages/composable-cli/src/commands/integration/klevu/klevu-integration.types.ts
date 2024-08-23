import { IntegrationCommandArguments } from "../integration.types"

export type KlevuIntegrationCommandData = {}

export type KlevuIntegrationCommandError = {
  code: string
  message: string
}

export type KlevuIntegrationCommandArguments = {
  klevuApiKey?: string
  klevuSearchUrl?: string
  klevuRestAuthKey?: string
} & IntegrationCommandArguments
