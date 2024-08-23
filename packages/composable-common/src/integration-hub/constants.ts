import { EpccRegion } from "./integration-hub-services"

export const ALGOLIA_INTEGRATION_NAME = "Algolia - Full / Delta / Large Catalog"
export const KLEVU_INTEGRATION_NAME = "Klevu Catalog Sync"

export const ALGOLIA_INTEGRATION_ID: Record<EpccRegion, string> = {
  "eu-west": "SW50ZWdyYXRpb246NTAyMTVmODYtZDgzYi00NDUxLWE5ODktMzIyNmQ5NjQzY2Iw",
  unknown: "SW50ZWdyYXRpb246ZTFmOTM2ZmUtMmE5MC00ODQxLWJhYjAtNTAzMjZkNWQ5OTI4",
  "us-east": "SW50ZWdyYXRpb246M2JmMjAwNTEtYjlhYy00MTQ3LWE3ODYtNGFmODNlOTcyZmE3",
} as const

export const KLEVU_INTEGRATION_ID: Record<EpccRegion, string> = {
  "eu-west": "SW50ZWdyYXRpb246ZGRlYmYzYjMtNTUyMi00MWEwLTg2YjctYzQxMzNkZGZhZjEy",
  unknown: "SW50ZWdyYXRpb246NjQ2Y2VhYjgtODgxMS00MDM3LWE5NjItZDYwMTczNTJkOTJi",
  "us-east": "SW50ZWdyYXRpb246MTMyMDllYzEtMDc5ZS00ZGVjLWEwMTQtY2E2YjM1ZmUxYzVi",
} as const

export const COMPOSABLE_INTEGRATION_HUB_DEPLOYER_URL =
  "https://composable-integration-hub-deployer.netlify.app/.netlify/functions"
