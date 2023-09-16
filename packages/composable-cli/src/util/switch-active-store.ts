import { switchUserStore } from "./build-store-prompts"
import Conf from "conf"

function createStoreSetter(store: Conf, apiUrl: string, token: string) {
  return async function setStore(storeId: string) {
    await switchUserStore(apiUrl, token, storeId)
    store.set("store", answers.store)
  }
}
