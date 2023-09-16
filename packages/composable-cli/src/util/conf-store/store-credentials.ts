import Conf from "conf"

export function storeCredentials(
  store: Conf,
  credentials: { accessToken: string; refreshToken: string; expires: number }
) {
  return store.set("credentials", credentials)
}
