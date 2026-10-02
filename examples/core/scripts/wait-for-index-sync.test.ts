import { describe, expect, test, vi } from "vitest"
import type { SearchIndex } from "@epcc-sdk/sdks-catalog-search"
import { waitForIndexesInSync } from "./wait-for-index-sync"

function index(releaseId: string): SearchIndex {
  return {
    id: `index-${releaseId}`,
    type: "catalog_search_index",
    meta: {
      catalog_id: "catalog",
      release_id: releaseId,
      out_of_sync: true,
      owner: "store",
    },
  }
}

function clock() {
  let elapsed = 0
  return {
    now: () => elapsed,
    sleep: vi.fn(async (ms: number) => {
      elapsed += ms
    }),
  }
}

const timing = { intervalMs: 5_000, timeoutMs: 60_000 }

describe("waitForIndexesInSync", () => {
  test("ends in sync as soon as no index is out of sync", async () => {
    const { now, sleep } = clock()
    const listOutOfSync = vi.fn(async () => ({ data: [] }))

    const outcome = await waitForIndexesInSync({
      listOutOfSync,
      now,
      sleep,
      ...timing,
    })

    expect(outcome).toEqual({ status: "in-sync", polls: 1 })
    expect(sleep).not.toHaveBeenCalled()
  })

  test("waits the interval and polls again while an index is out of sync", async () => {
    const { now, sleep } = clock()
    const listOutOfSync = vi
      .fn()
      .mockResolvedValueOnce({ data: [index("a"), index("b")] })
      .mockResolvedValueOnce({ data: [index("b")] })
      .mockResolvedValueOnce({ data: [] })

    const outcome = await waitForIndexesInSync({
      listOutOfSync,
      now,
      sleep,
      ...timing,
    })

    expect(outcome).toEqual({ status: "in-sync", polls: 3 })
    expect(sleep).toHaveBeenCalledTimes(2)
    expect(sleep).toHaveBeenCalledWith(timing.intervalMs)
  })

  test("reports each poll's out-of-sync indexes", async () => {
    const { now, sleep } = clock()
    const onPoll = vi.fn()
    const listOutOfSync = vi
      .fn()
      .mockResolvedValueOnce({ data: [index("a")] })
      .mockResolvedValueOnce({ data: [] })

    await waitForIndexesInSync({ listOutOfSync, now, sleep, onPoll, ...timing })

    expect(onPoll.mock.calls).toEqual([[[index("a")]], [[]]])
  })

  test("times out naming the indexes still out of sync", async () => {
    const { now, sleep } = clock()
    const listOutOfSync = vi.fn(async () => ({ data: [index("stuck")] }))

    const outcome = await waitForIndexesInSync({
      listOutOfSync,
      now,
      sleep,
      ...timing,
    })

    expect(outcome).toEqual({
      status: "timed-out",
      outOfSync: [index("stuck")],
    })
    expect(now()).toBeLessThanOrEqual(timing.timeoutMs)
    expect(listOutOfSync).toHaveBeenCalledTimes(
      timing.timeoutMs / timing.intervalMs + 1,
    )
  })

  test("ends on an error response without polling again", async () => {
    const { now, sleep } = clock()
    const error = { errors: [{ status: "403", title: "Forbidden" }] }
    const listOutOfSync = vi.fn(async () => ({ error }))

    const outcome = await waitForIndexesInSync({
      listOutOfSync,
      now,
      sleep,
      ...timing,
    })

    expect(outcome).toEqual({ status: "failed", error })
    expect(listOutOfSync).toHaveBeenCalledTimes(1)
  })

  test("ends on a request that throws", async () => {
    const { now, sleep } = clock()
    const error = new TypeError("fetch failed")
    const listOutOfSync = vi
      .fn()
      .mockResolvedValueOnce({ data: [index("a")] })
      .mockRejectedValueOnce(error)

    const outcome = await waitForIndexesInSync({
      listOutOfSync,
      now,
      sleep,
      ...timing,
    })

    expect(outcome).toEqual({ status: "failed", error })
  })

  test("treats a response with neither data nor error as a failure", async () => {
    const { now, sleep } = clock()

    const outcome = await waitForIndexesInSync({
      listOutOfSync: async () => ({}),
      now,
      sleep,
      ...timing,
    })

    expect(outcome.status).toBe("failed")
  })
})
