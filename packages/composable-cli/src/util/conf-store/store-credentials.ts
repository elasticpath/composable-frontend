import Conf from "conf"
import {
  epccUserProfileSchema,
  UserProfile,
} from "../../lib/epcc-user-profile-schema"
import { Credentials } from "../../lib/authentication/credentials-schema"
import { UserStore } from "../../lib/stores/stores-schema"
import { Result } from "../../types/results"

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

export function getUserProfile(store: Conf): Result<UserProfile, Error> {
  const possibleProfile = store.get("profile")

  if (!possibleProfile) {
    return {
      success: false,
      error: new Error("No profile found in store"),
    }
  }

  const parsedProfile = epccUserProfileSchema.safeParse(possibleProfile)

  if (!parsedProfile.success) {
    return {
      success: false,
      error: new Error(
        `Profile failed to parse from store - ${parsedProfile.error.errors.toString()}`,
      ),
    }
  }

  return {
    success: true,
    data: parsedProfile.data,
  }
}
