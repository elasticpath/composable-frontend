import { InputInstanceConfigVariable } from "../codegen/gql/graphql"

export interface KlevuIntegrationConfig {
  klevuApiKey: string
  klevuSearchUrl: string
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

export function createKlevuIntegrationConfig({
  epccComponentConnectionShared,
  epccBaseUrl,
}: KlevuIntegrationConfig): InputInstanceConfigVariable[] {
  const { clientId, clientSecret, tokenUrl } = epccComponentConnectionShared
  return [
    {
      key: "Elastic Path Commerce Cloud Component Connection - Shared",
      values: `[{"name":"clientId","type":"value","value":"${clientId}"},{"name":"tokenUrl","type":"value","value":"${tokenUrl}"},{"name":"clientSecret","type":"value","value":"${clientSecret}"}]`,
    },
    {
      key: "epcc_base_url",
      value: epccBaseUrl,
    },
  ]
}
