import Conf from "conf"

export function isAuthenticated(store: Conf): boolean {
  return store.has("credentials")
}
