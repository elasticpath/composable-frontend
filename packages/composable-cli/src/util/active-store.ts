import Conf from "conf"

export function hasActiveStore(store: Conf): boolean {
  return store.has("store")
}
