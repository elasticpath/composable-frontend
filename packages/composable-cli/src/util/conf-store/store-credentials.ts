import Conf from "conf"
import { UserProfile } from "../../lib/epcc-user-profile-schema"

export function storeCredentials(
  store: Conf,
  credentials: { accessToken: string; refreshToken: string; expires: number }
) {
  return store.set("credentials", credentials)
}

export function handleClearCredentials(store: Conf): void {
  store.delete("credentials")
  store.delete("store")
  store.delete("region")
  store.delete("profile")
}

export function storeUserProfile(store: Conf, userProfile: UserProfile) {
  return store.set("profile", userProfile)
}
