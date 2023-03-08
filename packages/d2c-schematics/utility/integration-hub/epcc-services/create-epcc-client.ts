import type { ConfigOptions, Moltin } from "@moltin/sdk"
import { gateway } from "@moltin/sdk"

export function createEpccClient(options: ConfigOptions): Moltin {
  return gateway({
    ...options,
  })
}
