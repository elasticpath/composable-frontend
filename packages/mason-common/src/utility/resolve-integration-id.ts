import type { EpccRegion } from "../integration-hub/integration-hub-services/create-urql-client"
import { ALGOLIA_INTEGRATION_ID } from "../integration-hub"

export function resolveIntegrationId(region: EpccRegion): string {
  console.log("region: ", region, ALGOLIA_INTEGRATION_ID)
  return ALGOLIA_INTEGRATION_ID[region] ?? ALGOLIA_INTEGRATION_ID["other"]
}
