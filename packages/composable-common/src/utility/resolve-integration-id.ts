import type { EpccRegion } from "../integration-hub/integration-hub-services/create-urql-client"
import { ALGOLIA_INTEGRATION_ID } from "../integration-hub"

export function resolveIntegrationId(region: EpccRegion): string {
  return ALGOLIA_INTEGRATION_ID[region]
}
