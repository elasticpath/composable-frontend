import { beforeEach, describe, expect, test, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revokeShare: vi.fn(),
}))

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }))

vi.mock("@/lib/cart-context", () => ({
  requireCartContext: async () => ({
    accountId: "account-1",
    port: {},
    cookieCartId: undefined,
  }),
}))

vi.mock("@/lib/shares-store", () => ({
  SharesUnavailableError: class extends Error {},
  openShareStore: async () => ({}),
}))

vi.mock("@/lib/shares", () => ({ revokeShare: mocks.revokeShare }))

vi.mock("@/lib/shared-carts", () => ({ shareSavedCart: vi.fn() }))

beforeEach(() => {
  vi.resetModules()
  mocks.revalidatePath.mockReset()
  mocks.revokeShare.mockReset()
})

async function revoke(entryId: string) {
  const { revokeShareLink } = await import("./share-actions")
  return revokeShareLink(entryId)
}

describe("revokeShareLink", () => {
  test("a link that was removed reads as revoked and refreshes the list", async () => {
    mocks.revokeShare.mockResolvedValue({ removed: true })

    expect(await revoke("entry-1")).toEqual({ status: "revoked" })
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/saved-carts")
  })

  test("a link that is already gone reads as revoked and refreshes the list, so its row disappears", async () => {
    mocks.revokeShare.mockResolvedValue({ removed: false, reason: "not_found" })

    expect(await revoke("entry-1")).toEqual({ status: "revoked" })
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/saved-carts")
  })
})
