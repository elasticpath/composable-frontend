import Conf from "conf"
import { UserProfile } from "../../lib/epcc-user-profile-schema"
import { Credentials } from "../../lib/authentication/credentials-schema"
import { UserStore } from "../../lib/stores/stores-schema"

export function storeCredentials(store: Conf, credentials: Credentials) {
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

export function storeUserStore(store: Conf, userStore: UserStore) {
  return store.set("store", userStore)
}
