import Conf from "conf"

export function hasUUID(store: Conf): boolean {
  return store.has("uuid")
}

export function setUUID(store: Conf, uuid: string): void {
  store.set("uuid", uuid)
}
