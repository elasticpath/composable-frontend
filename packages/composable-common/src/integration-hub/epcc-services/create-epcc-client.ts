import type { ConfigOptions, Moltin } from "@moltin/sdk"
import { gateway, MemoryStorageFactory } from "@moltin/sdk"

export function createEpccClient(options: ConfigOptions): Moltin {
  return gateway({
    ...options,
    storage: new MemoryStorageFactory(),
  })
}
