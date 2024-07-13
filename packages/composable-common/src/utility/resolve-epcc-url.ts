import type { EpccRegion } from "../integration-hub/integration-hub-services/create-urql-client"
import { resolveRegion } from "./resolve-region"

function resolveEpccHost(region: Omit<EpccRegion, "unknown">): string {
  switch (region) {
    case "eu-west":
      return "api.moltin.com"
    case "us-east":
      return "useast.api.elasticpath.com"
    default:
      return "useast.api.elasticpath.com"
  }
}

export function resolveEpccBaseUrl(host: string): string {
  const region = resolveRegion(host)

  const url = region === "unknown" ? host : resolveEpccHost(region)
  return `https://${url}`
}
