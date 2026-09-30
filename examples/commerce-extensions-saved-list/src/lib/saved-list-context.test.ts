import { beforeEach, describe, expect, test, vi } from "vitest"

const lookup = vi.hoisted(() => ({ resolve: vi.fn() }))

vi.mock("./account-session", () => ({
  IdentityUnavailableError: class extends Error {},
  getShopperSession: async () => ({ accountId: "account", accountName: "" }),
}))

vi.mock("./commerce-extensions-store", () => ({
  createSavedListEntryStore: () => ({}),
  resolveSavedListCustomApiId: lookup.resolve,
}))

import { getSavedListContext } from "./saved-list-context"

beforeEach(() => {
  lookup.resolve.mockReset()
  vi.spyOn(console, "error").mockImplementation(() => {})
})

describe("getSavedListContext", () => {
  test("a failed Custom API lookup is unavailable, not unprovisioned", async () => {
    lookup.resolve.mockRejectedValue(new Error("fetch failed"))

    const context = await getSavedListContext()

    expect(context).toMatchObject({ ok: false, status: 503 })
    expect(context.ok || context.message).not.toMatch(/provision/i)
  })

  test("a Custom API that is not there says to provision", async () => {
    lookup.resolve.mockResolvedValue(undefined)

    const context = await getSavedListContext()

    expect(context).toMatchObject({ ok: false, status: 503 })
    expect(context.ok || context.message).toMatch(/provision/i)
  })
})
