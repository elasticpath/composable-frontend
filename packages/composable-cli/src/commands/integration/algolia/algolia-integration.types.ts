import { IntegrationCommandArguments } from "../integration.types"

export type AlgoliaIntegrationCommandData = {
  indexName?: string
}

export type AlgoliaIntegrationCommandError = {
  code: string
  message: string
}

export type AlgoliaIntegrationCommandArguments = {
  algoliaApplicationId?: string
  algoliaAdminApiKey?: string
  algoliaSearchApiKey?: string
} & IntegrationCommandArguments
