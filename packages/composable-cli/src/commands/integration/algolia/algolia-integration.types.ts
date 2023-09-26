import { IntegrationCommandArguments } from "../integration.types"

export type AlgoliaIntegrationCommandData = {}

export type AlgoliaIntegrationCommandError = {
  code: string
  message: string
}

export type AlgoliaIntegrationCommandArguments = {
  algoliaApplicationId?: string
  algoliaAdminApiKey?: string
} & IntegrationCommandArguments