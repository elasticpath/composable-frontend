import Conf from "conf"
import { Region, regionSchema } from "../lib/stores/region-schema"
import { Result } from "../types/results"

export function resolveHostFromRegion(
  host: Region
): "https://euwest.api.elasticpath.com" | "https://useast.api.elasticpath.com" {
  switch (host) {
    case "eu-west":
      return "https://euwest.api.elasticpath.com"
    case "us-east":
      return "https://useast.api.elasticpath.com"
    default:
      return "https://euwest.api.elasticpath.com"
  }
}

export function resolveHostNameFromRegion(
  host: Region
): "euwest.api.elasticpath.com" | "useast.api.elasticpath.com" {
  switch (host) {
    case "eu-west":
      return "euwest.api.elasticpath.com"
    case "us-east":
      return "useast.api.elasticpath.com"
    default:
      return "euwest.api.elasticpath.com"
  }
}

export function getRegion(store: Conf): Result<"eu-west" | "us-east", Error> {
  const parsedStore = regionSchema.safeParse(store.get("region"))

  if (!parsedStore.success) {
    return {
      success: false,
      error: new Error(
        `Region not found in store: ${parsedStore.error.message}`
      ),
    }
  }

  return {
    success: true,
    data: parsedStore.data,
  }
}
