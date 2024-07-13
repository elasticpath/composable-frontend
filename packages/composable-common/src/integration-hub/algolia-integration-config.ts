import { InputInstanceConfigVariable } from "../codegen/gql/graphql"

export interface AlgoliaIntegrationConfig {
  algoliaAppId: string
  algoliaAdminApiKey: string
  epccComponentConnectionShared: {
    clientId: string
    clientSecret: string
    tokenUrl: string
  }
  epccBaseUrl: string
  webhookKey: string
  webhookUrl?: string
  webhookApiKey?: string
  batchSize?: string
  concurrentThreads?: string
}

// TODO what happens if we don't specify the values that have defaults???
//  do we need to be setting the at all on the request?
export function createAlgoliaIntegrationConfig({
  algoliaAppId,
  algoliaAdminApiKey,
  epccComponentConnectionShared,
  epccBaseUrl,
  webhookKey,
  webhookUrl = "none",
  webhookApiKey = "none",
  batchSize = "250",
  concurrentThreads = "10",
}: AlgoliaIntegrationConfig): InputInstanceConfigVariable[] {
  const { clientId, clientSecret, tokenUrl } = epccComponentConnectionShared
  return [
    {
      key: "algolia_app_id",
      value: algoliaAppId,
    },
    {
      key: "algolia_admin_api_key",
      value: algoliaAdminApiKey,
    },
    {
      key: "Elastic Path Commerce Cloud Component Connection - Shared",
      values: `[{"name":"clientId","type":"value","value":"${clientId}"},{"name":"tokenUrl","type":"value","value":"${tokenUrl}"},{"name":"clientSecret","type":"value","value":"${clientSecret}"}]`,
    },
    {
      key: "epcc_base_url",
      value: epccBaseUrl,
    },
    {
      key: "webhook_key",
      value: webhookKey,
    },
    {
      key: "webhook_url",
      value: webhookUrl,
    },
    {
      key: "webhook_api_key",
      values: `[{"name":"apiKey","type":"value","value":"${webhookApiKey}"}]`,
    },
    {
      key: "batch_size",
      value: batchSize,
    },
    {
      key: "concurrent_threads",
      value: concurrentThreads,
    },
  ]
}
