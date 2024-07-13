import Conf from "conf"
import { Result } from "../../types/results"
import { z } from "zod"

export async function getUUID(store: Conf): Promise<Result<string, Error>> {
  const parsedStore = z.string().safeParse(store.get("uuid"))

  if (!parsedStore.success) {
    return {
      success: false,
      error: new Error(`UUID not found in store: ${parsedStore.error.message}`),
    }
  }

  return {
    success: true,
    data: parsedStore.data,
  }
}
