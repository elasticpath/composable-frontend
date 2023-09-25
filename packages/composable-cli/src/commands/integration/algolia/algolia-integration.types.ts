import { IntegrationCommandArguments } from "../integration.types"

export type AlgoliaIntegrationCommandData = {}

export type AlgoliaIntegrationCommandError = {
  code: string
  message: string
}

export type AlgoliaIntegrationCommandArguments = {
  appId?: string
  adminApiKey?: string
} & IntegrationCommandArguments
