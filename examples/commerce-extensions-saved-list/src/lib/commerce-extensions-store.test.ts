import { beforeEach, describe, expect, test, vi } from "vitest"

const sdk = vi.hoisted(() => ({
  listCustomApis: vi.fn(),
  getACustomEntry: vi.fn(),
}))

vi.mock("@epcc-sdk/commerce-extensions", () => ({
  client: { setConfig: vi.fn(), interceptors: { request: { use: vi.fn() } } },
  createACustomApiEntry: vi.fn(),
  deleteACustomEntry: vi.fn(),
  getACustomEntry: sdk.getACustomEntry,
  listCustomApiEntries: vi.fn(),
  listCustomApis: sdk.listCustomApis,
}))

vi.mock("./server-credentials", () => ({
  getServerAccessToken: async () => "server-token",
}))

const networkFailure = {
  data: undefined,
  error: new TypeError("fetch failed"),
  response: undefined,
}

beforeEach(() => {
  vi.resetModules()
  sdk.listCustomApis.mockReset()
  sdk.getACustomEntry.mockReset()
})

async function load() {
  return import("./commerce-extensions-store")
}

describe("resolveSavedListCustomApiId", () => {
  test("a failed lookup throws rather than reading as not provisioned", async () => {
    sdk.listCustomApis.mockResolvedValue(networkFailure)
    const { resolveSavedListCustomApiId } = await load()

    await expect(resolveSavedListCustomApiId()).rejects.toThrow()
  })

  test("a successful lookup with no match means not provisioned", async () => {
    sdk.listCustomApis.mockResolvedValue({ data: { data: [] } })
    const { resolveSavedListCustomApiId } = await load()

    expect(await resolveSavedListCustomApiId()).toBeUndefined()
  })
})

describe("entry store get", () => {
  test("a 404 means the entry does not exist", async () => {
    sdk.getACustomEntry.mockResolvedValue({
      data: undefined,
      error: { errors: [{ status: 404 }] },
      response: { status: 404 },
    })
    const { createSavedListEntryStore } = await load()

    expect(await createSavedListEntryStore("api-id").get("entry")).toBeNull()
  })

  test("any other failure throws rather than reading as not found", async () => {
    sdk.getACustomEntry.mockResolvedValue(networkFailure)
    const { createSavedListEntryStore } = await load()

    await expect(
      createSavedListEntryStore("api-id").get("entry"),
    ).rejects.toThrow()
  })
})
