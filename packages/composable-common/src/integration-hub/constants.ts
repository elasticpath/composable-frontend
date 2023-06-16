import { EpccRegion } from "./integration-hub-services"

export const ALGOLIA_INTEGRATION_NAME = "Algolia - Full / Delta / Large Catalog"

export const ALGOLIA_INTEGRATION_ID: Record<EpccRegion, string> = {
  "eu-west": "SW50ZWdyYXRpb246ODc4Y2ZiYjEtMzU4ZC00Y2QyLThkMmEtNjVhOTM1YTJkMmFi",
  unknown: "SW50ZWdyYXRpb246NjQ2Y2VhYjgtODgxMS00MDM3LWE5NjItZDYwMTczNTJkOTJi",
  "us-east": "SW50ZWdyYXRpb246ZTAyMzcyODgtZjRiYi00YTliLWI0YzMtMjQ4MGI2MTM0Nzlh",
} as const

export const COMPOSABLE_INTEGRATION_HUB_DEPLOYER_URL =
  "https://composable-integration-hub-deployer.netlify.app/.netlify/functions"
