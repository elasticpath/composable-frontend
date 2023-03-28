import { Client, createClient } from "@urql/core"
import fetch from "node-fetch"

export type EpccRegion = `${string | "eu-west" | "us-east"}`

export function createUrqlClient(jwtToken: string, region: EpccRegion): Client {
  return createClient({
    url: resolveIntegrationHubBaseUrl(region),
    fetchOptions: {
      headers: {
        authorization: `Bearer ${jwtToken}`,
      },
    },
    fetch: fetch as any,
  })
}

function resolveIntegrationHubHost(region: EpccRegion): string {
  switch (region) {
    case "eu-west":
      return "eu-west-1"
    case "us-east":
      return "us-east-2"
    default:
      // Falling back to a default of us-east-2
      return "us-east-2"
  }
}

function resolveIntegrationHubBaseUrl(region: EpccRegion): string {
  return `https://${resolveIntegrationHubHost(
    region
  )}.elasticpathintegrations.com/api/`
}
