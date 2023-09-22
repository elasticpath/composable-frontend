import { PostHog } from "posthog-node"
import { getProfile } from "../authentication/get-profile"
import Conf from "conf"
import { EventMessageV1 } from "posthog-node/lib/posthog-node/src/types"
import { getUUID } from "../authentication/get-uuid"

export async function createPostHogCapture(store: Conf, client: PostHog) {
  const uuidResult = await getUUID(store)

  if (!uuidResult.success) {
    throw new Error(
      `Unable to create post hog capture failed to get uuid from store: ${uuidResult.error.message}`
    )
  }

  const profile = await getProfile(store)

  const resolvedDistinctId = profile.success ? profile.data.id : uuidResult.data

  return function capt(args: Omit<EventMessageV1, "distinctId">) {
    return client.capture({
      ...args,
      distinctId: resolvedDistinctId,
      properties: {
        ...args.properties,
        $set_once: {
          ...args.properties?.["$set_once"],
          cli_user: true,
        },
      },
    })
  }
}
