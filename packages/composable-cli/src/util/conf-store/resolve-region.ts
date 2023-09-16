import Conf from "conf"

export function resolveRegion(store: Conf): "us-east" | "eu-west" {
  return store.get("region") as any
}
