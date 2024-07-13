import { Client, createClient } from "@urql/core"
import fetch from "node-fetch"
import { resolveIntegrationHubBaseUrl } from "../helpers"

export type EpccRegion = "unknown" | "eu-west" | "us-east"

export function createUrqlClient(jwtToken: string, region: EpccRegion): Client {
  return createClient({
    url: resolveIntegrationHubBaseUrl(region),
    fetchOptions: {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
    fetch: fetch as any,
  })
}
