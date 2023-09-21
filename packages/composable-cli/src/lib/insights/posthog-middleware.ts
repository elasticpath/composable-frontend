import { CommandContext } from "../../types/command"
import { MiddlewareFunction } from "yargs"
import { isOptIn } from "../../util/has-opted-insights"
import { PostHog } from "posthog-node"
import { createPostHogCapture } from "./capture-posthog"

export function createPostHogMiddleware(
  ctx: CommandContext
): MiddlewareFunction {
  return async function postHogMiddleware(_argv: any) {
    const { store } = ctx

    if (!isOptIn(store)) {
      return
    }

    const postHogKey = process.env.POSTHOG_PUBLIC_API_KEY

    if (!postHogKey) {
      console.warn(
        "Missing POSTHOG_PUBLIC_API_KEY environment variable at build time, skipping PostHog."
      )
      return
    }

    const client = new PostHog(postHogKey, {
      host: "https://app.posthog.com",
    })

    ctx.posthog = {
      client,
      postHogCapture: await createPostHogCapture(store, client),
    }
    return
  }
}
