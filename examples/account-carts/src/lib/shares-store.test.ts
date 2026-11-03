import { beforeEach, describe, expect, test, vi } from "vitest"

const sdk = vi.hoisted(() => ({
  listCustomApis: vi.fn(),
  listCustomApiEntries: vi.fn(),
  getACustomEntry: vi.fn(),
  createACustomApiEntry: vi.fn(),
  deleteACustomEntry: vi.fn(),
}))

vi.mock("@epcc-sdk/commerce-extensions", () => ({
  client: { setConfig: vi.fn(), interceptors: { request: { use: vi.fn() } } },
  createACustomApiEntry: sdk.createACustomApiEntry,
  deleteACustomEntry: sdk.deleteACustomEntry,
  getACustomEntry: sdk.getACustomEntry,
  listCustomApiEntries: sdk.listCustomApiEntries,
  listCustomApis: sdk.listCustomApis,
}))

vi.mock("./server-credentials", () => ({
  getServerAccessToken: async () => "server-token",
}))

const TOKEN = "T".repeat(43)
const ENTRY_ID = "6f1b6c1e-2d0a-4b8e-9c55-3a7d1f0e8b21"

const networkFailure = {
  data: undefined,
  error: new TypeError("fetch failed"),
  response: undefined,
}

const apiEntry = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  type: "cart_share_ext",
  share_token: TOKEN,
  cart_id: "cart-1",
  account_id: "account-1",
  shared_at: "2026-10-05T09:00:00.000Z",
  ...overrides,
})

beforeEach(() => {
  vi.resetModules()
  vi.unstubAllEnvs()
  for (const mock of Object.values(sdk)) mock.mockReset()
  vi.stubEnv("EPCC_CLIENT_ID", "server-id")
  vi.stubEnv("EPCC_CLIENT_SECRET", "server-secret")
})

async function load() {
  return import("./shares-store")
}

describe("sharesCustomApiStatus", () => {
  test("a Custom API the store holds reads as provisioned", async () => {
    sdk.listCustomApis.mockResolvedValue({
      data: { data: [{ id: "api-id", slug: "cart-shares" }] },
    })
    const { sharesCustomApiStatus } = await load()

    expect(await sharesCustomApiStatus()).toBe("provisioned")
  })

  test("a successful lookup with no match reads as missing", async () => {
    sdk.listCustomApis.mockResolvedValue({ data: { data: [] } })
    const { sharesCustomApiStatus } = await load()

    expect(await sharesCustomApiStatus()).toBe("missing")
  })

  test("a failed lookup reads as unreadable, never as missing", async () => {
    sdk.listCustomApis.mockResolvedValue(networkFailure)
    const { sharesCustomApiStatus } = await load()

    expect(await sharesCustomApiStatus()).toBe("unreadable")
  })

  test("a slug that only resembles ours is not ours", async () => {
    sdk.listCustomApis.mockResolvedValue({
      data: { data: [{ id: "api-id", slug: "cart-shares-old" }] },
    })
    const { sharesCustomApiStatus } = await load()

    expect(await sharesCustomApiStatus()).toBe("missing")
  })
})

describe("openShareStore", () => {
  test("says the Custom API is not provisioned when the store lacks it", async () => {
    sdk.listCustomApis.mockResolvedValue({ data: { data: [] } })
    const { openShareStore } = await load()

    await expect(openShareStore()).rejects.toMatchObject({
      name: "SharesUnavailableError",
      reason: "not-provisioned",
    })
  })

  test("a failed lookup is unreachable, not not-provisioned", async () => {
    sdk.listCustomApis.mockResolvedValue(networkFailure)
    const { openShareStore } = await load()

    await expect(openShareStore()).rejects.toMatchObject({
      reason: "unreachable",
    })
  })

  test("without the server key it says so and does not call the store", async () => {
    vi.stubEnv("EPCC_CLIENT_SECRET", "")
    const { openShareStore } = await load()

    await expect(openShareStore()).rejects.toMatchObject({
      reason: "no-server-key",
    })
    expect(sdk.listCustomApis).not.toHaveBeenCalled()
  })
})

describe("share store", () => {
  async function store() {
    sdk.listCustomApis.mockResolvedValue({
      data: { data: [{ id: "api-id", slug: "cart-shares" }] },
    })
    const { openShareStore } = await load()
    return openShareStore()
  }

  test("list reads every page", async () => {
    const page = (from: number, count: number) => ({
      data: {
        data: Array.from({ length: count }, (_, i) => apiEntry(`e${from + i}`)),
      },
    })
    sdk.listCustomApiEntries
      .mockResolvedValueOnce(page(0, 100))
      .mockResolvedValueOnce(page(100, 3))

    const entries = await (await store()).list("eq(account_id,account-1)")

    expect(entries).toHaveLength(103)
    expect(sdk.listCustomApiEntries.mock.calls[1]![0]).toMatchObject({
      path: { "custom-api-id": "api-id" },
      query: { filter: "eq(account_id,account-1)", "page[offset]": 100 },
    })
  })

  test("list turns an entry into the fields the example uses", async () => {
    sdk.listCustomApiEntries.mockResolvedValue({
      data: { data: [apiEntry("e1")] },
    })

    const entries = await (await store()).list("eq(account_id,account-1)")

    expect(entries).toEqual([
      {
        id: "e1",
        share_token: TOKEN,
        cart_id: "cart-1",
        account_id: "account-1",
        shared_at: "2026-10-05T09:00:00.000Z",
      },
    ])
  })

  test("a failed list throws rather than reading as no shares", async () => {
    sdk.listCustomApiEntries.mockResolvedValue(networkFailure)

    await expect(
      (await store()).list("eq(account_id,account-1)"),
    ).rejects.toThrow()
  })

  test("an error response with a body of data still throws", async () => {
    sdk.listCustomApiEntries.mockResolvedValue({
      data: { data: [apiEntry("e1")] },
      error: { errors: [{ status: 500 }] },
    })

    await expect(
      (await store()).list("eq(account_id,account-1)"),
    ).rejects.toThrow()
  })

  test("get returns null on a 404", async () => {
    sdk.getACustomEntry.mockResolvedValue({
      data: undefined,
      error: { errors: [{ status: 404 }] },
      response: { status: 404 },
    })

    expect(await (await store()).get(ENTRY_ID)).toBeNull()
  })

  test("get treats an id that is not a Custom API entry id as not found, without calling the API", async () => {
    const entries = await store()

    expect(await entries.get("e1")).toBeNull()
    expect(await entries.get("../other-api/entries")).toBeNull()
    expect(sdk.getACustomEntry).not.toHaveBeenCalled()
  })

  test("get throws on any other failure rather than reading as not found", async () => {
    sdk.getACustomEntry.mockResolvedValue(networkFailure)

    await expect((await store()).get(ENTRY_ID)).rejects.toThrow()
  })

  test("create sends the share fields under the Custom API's type", async () => {
    sdk.createACustomApiEntry.mockResolvedValue({
      data: { data: apiEntry("e1") },
    })

    const created = await (
      await store()
    ).create({
      share_token: TOKEN,
      cart_id: "cart-1",
      account_id: "account-1",
      shared_at: "2026-10-05T09:00:00.000Z",
    })

    expect(created.id).toBe("e1")
    expect(sdk.createACustomApiEntry.mock.calls[0]![0]).toMatchObject({
      path: { "custom-api-id": "api-id" },
      body: {
        data: {
          type: "cart_share_ext",
          share_token: TOKEN,
          cart_id: "cart-1",
          account_id: "account-1",
          shared_at: "2026-10-05T09:00:00.000Z",
        },
      },
    })
  })

  test("a failed create throws", async () => {
    sdk.createACustomApiEntry.mockResolvedValue(networkFailure)

    await expect(
      (await store()).create({
        share_token: TOKEN,
        cart_id: "c",
        account_id: "a",
        shared_at: "x",
      }),
    ).rejects.toThrow()
  })

  test("a failed remove throws", async () => {
    sdk.deleteACustomEntry.mockResolvedValue(networkFailure)

    await expect((await store()).remove("e1")).rejects.toThrow()
  })
})

describe("lookupShareByToken", () => {
  test("finds a share by its token through the store", async () => {
    sdk.listCustomApis.mockResolvedValue({
      data: { data: [{ id: "api-id", slug: "cart-shares" }] },
    })
    sdk.listCustomApiEntries.mockResolvedValue({
      data: { data: [apiEntry("e1")] },
    })
    const { lookupShareByToken } = await load()

    const found = await lookupShareByToken(TOKEN)

    expect(found).toMatchObject({ id: "e1", cart_id: "cart-1" })
    expect(sdk.listCustomApiEntries.mock.calls[0]![0]).toMatchObject({
      query: { filter: `eq(share_token,${TOKEN})` },
    })
  })

  test("a token no share holds is null", async () => {
    sdk.listCustomApis.mockResolvedValue({
      data: { data: [{ id: "api-id", slug: "cart-shares" }] },
    })
    sdk.listCustomApiEntries.mockResolvedValue({ data: { data: [] } })
    const { lookupShareByToken } = await load()

    expect(await lookupShareByToken(TOKEN)).toBeNull()
  })

  test("a malformed token is null without calling the store", async () => {
    const { lookupShareByToken } = await load()

    expect(await lookupShareByToken("short")).toBeNull()
    expect(sdk.listCustomApis).not.toHaveBeenCalled()
    expect(sdk.listCustomApiEntries).not.toHaveBeenCalled()
  })

  test("an outage throws rather than reading as an unknown token", async () => {
    sdk.listCustomApis.mockResolvedValue({
      data: { data: [{ id: "api-id", slug: "cart-shares" }] },
    })
    sdk.listCustomApiEntries.mockResolvedValue(networkFailure)
    const { lookupShareByToken } = await load()

    await expect(lookupShareByToken(TOKEN)).rejects.toThrow()
  })
})
