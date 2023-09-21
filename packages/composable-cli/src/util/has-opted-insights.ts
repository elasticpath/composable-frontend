import Conf from "conf"

export function isOptedInsights(store: Conf): boolean {
  return store.has("insights")
}

export function isOptIn(store: Conf): boolean {
  const insights = store.get("insights")
  return typeof insights === "boolean" && insights === true
}

export function optInsights(store: Conf, optIn: boolean): void {
  store.set("insights", optIn)
}
