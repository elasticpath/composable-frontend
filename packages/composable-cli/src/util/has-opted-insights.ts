import Conf from "conf"

export function isOptedInsights(store: Conf): boolean {
  return store.has("insights")
}

export function optInsights(store: Conf, optIn: boolean): void {
  store.set("insights", optIn)
}
