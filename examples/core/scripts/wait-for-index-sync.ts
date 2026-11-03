import type { SearchIndex } from "@epcc-sdk/sdks-catalog-search"

export type OutOfSyncListing = { data?: SearchIndex[]; error?: unknown }

export type IndexSyncOutcome =
  | { status: "in-sync"; polls: number }
  | { status: "timed-out"; outOfSync: SearchIndex[] }
  | { status: "failed"; error: unknown }

type WaitForIndexesInSyncOptions = {
  listOutOfSync: () => Promise<OutOfSyncListing>
  intervalMs: number
  timeoutMs: number
  now?: () => number
  sleep?: (ms: number) => Promise<void>
  onPoll?: (outOfSync: SearchIndex[]) => void
}

export async function waitForIndexesInSync({
  listOutOfSync,
  intervalMs,
  timeoutMs,
  now = Date.now,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  onPoll,
}: WaitForIndexesInSyncOptions): Promise<IndexSyncOutcome> {
  const deadline = now() + timeoutMs

  for (let polls = 1; ; polls++) {
    let listing: OutOfSyncListing

    try {
      listing = await listOutOfSync()
    } catch (error) {
      return { status: "failed", error }
    }

    if (listing.error || !listing.data) {
      return {
        status: "failed",
        error: listing.error ?? "The search-indexes listing returned no data.",
      }
    }

    onPoll?.(listing.data)

    if (listing.data.length === 0) {
      return { status: "in-sync", polls }
    }

    if (now() + intervalMs > deadline) {
      return { status: "timed-out", outOfSync: listing.data }
    }

    await sleep(intervalMs)
  }
}
