import type { EpccRegion } from "../integration-hub/integration-hub-services/create-urql-client"

function resolveEpccHost(region: EpccRegion): string {
  switch (region) {
    case "eu-west":
      return "api.moltin.com"
    case "us-east":
      return "useast.api.elasticpath.com"
    default:
      return region
  }
}

export function resolveEpccBaseUrl(region: EpccRegion): string {
  return `https://${resolveEpccHost(region)}`
}
