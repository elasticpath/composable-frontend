import Conf from "conf"
import { Result } from "../../types/results"
import { UserStore, userStoreSchema } from "./stores-schema"

export async function getStore(store: Conf): Promise<Result<UserStore, Error>> {
  const parsedStore = userStoreSchema.safeParse(store.get("store"))

  if (!parsedStore.success) {
    return {
      success: false,
      error: new Error(
        `Store not found in store: ${parsedStore.error.message}`
      ),
    }
  }

  return {
    success: true,
    data: parsedStore.data,
  }
}
