import type { EpccRegion } from "../integration-hub/integration-hub-services/create-urql-client"

export function resolveRegion(host: string): EpccRegion {
  switch (host) {
    case "useast.api.elasticpath.com":
      return "us-east"
    case "euwest.api.elasticpath.com":
      return "eu-west"
    case "api.moltin.com":
      return "eu-west"
    default:
      return "unknown"
  }
}
