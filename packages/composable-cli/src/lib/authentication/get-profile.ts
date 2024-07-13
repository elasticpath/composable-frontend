import Conf from "conf"
import { Result } from "../../types/results"
import { epccUserProfileSchema, UserProfile } from "../epcc-user-profile-schema"

export async function getProfile(
  store: Conf
): Promise<Result<UserProfile, Error>> {
  const parsedStore = epccUserProfileSchema.safeParse(store.get("profile"))

  if (!parsedStore.success) {
    return {
      success: false,
      error: new Error(
        `User profile not found in store: ${parsedStore.error.message}`
      ),
    }
  }

  return {
    success: true,
    data: parsedStore.data,
  }
}
