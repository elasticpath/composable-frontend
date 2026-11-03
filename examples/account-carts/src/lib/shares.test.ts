import { describe, expect, test } from "vitest"
import {
  SHARE_TOKEN_PATTERN,
  UnsafeIdentifierError,
  byShareTokenFilter,
  createShare,
  findShareByToken,
  generateShareToken,
  listShares,
  ownedByAccountFilter,
  revokeShare,
  type ShareEntry,
  type ShareStore,
} from "./shares"

const ALICE = "11111111-1111-1111-1111-111111111111"
const BOB = "22222222-2222-2222-2222-222222222222"
const ALICE_CART = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
const TOKEN_A = "A".repeat(43)
const TOKEN_B = "B".repeat(43)
const NOW = new Date("2026-10-05T09:00:00.000Z")

const entry = (overrides: Partial<ShareEntry> = {}): ShareEntry => ({
  id: "entry-1",
  share_token: TOKEN_A,
  cart_id: ALICE_CART,
  account_id: ALICE,
  shared_at: NOW.toISOString(),
  ...overrides,
})

function fakeStore(seed: ShareEntry[] = []) {
  const entries = [...seed]
  const calls = {
    list: [] as string[],
    create: [] as Omit<ShareEntry, "id">[],
    remove: [] as string[],
  }

  const store: ShareStore = {
    async list(filter) {
      calls.list.push(filter)
      const match = /^eq\((account_id|share_token),(.*)\)$/.exec(filter)
      if (!match) return [...entries]
      return entries.filter(
        (e) => e[match[1] as "account_id" | "share_token"] === match[2],
      )
    },
    async get(entryId) {
      return entries.find((e) => e.id === entryId) ?? null
    },
    async create(values) {
      const created = { id: `entry-${entries.length + 1}`, ...values }
      calls.create.push(values)
      entries.push(created)
      return created
    },
    async remove(entryId) {
      calls.remove.push(entryId)
      const index = entries.findIndex((e) => e.id === entryId)
      if (index >= 0) entries.splice(index, 1)
    },
  }

  return { store, calls, entries }
}

describe("generateShareToken", () => {
  test("makes a url-safe token that passes the token pattern", () => {
    expect(generateShareToken()).toMatch(SHARE_TOKEN_PATTERN)
  })

  test("never repeats", () => {
    const tokens = new Set(Array.from({ length: 200 }, generateShareToken))

    expect(tokens.size).toBe(200)
  })
})

describe("filters", () => {
  test("ownedByAccountFilter scopes the query to one account", () => {
    expect(ownedByAccountFilter(ALICE)).toBe(`eq(account_id,${ALICE})`)
  })

  test("ownedByAccountFilter refuses an empty account id rather than matching every share", () => {
    expect(() => ownedByAccountFilter("")).toThrow(UnsafeIdentifierError)
  })

  test("ownedByAccountFilter refuses an account id carrying filter syntax", () => {
    expect(() => ownedByAccountFilter(`${ALICE}),ge(id,0`)).toThrow(
      UnsafeIdentifierError,
    )
  })

  test("byShareTokenFilter matches one token", () => {
    expect(byShareTokenFilter(TOKEN_A)).toBe(`eq(share_token,${TOKEN_A})`)
  })

  test("byShareTokenFilter refuses anything that is not a token", () => {
    for (const bad of ["", "short", `${TOKEN_A}),ge(id,0`, `${TOKEN_A}x`]) {
      expect(() => byShareTokenFilter(bad)).toThrow(UnsafeIdentifierError)
    }
  })
})

describe("createShare", () => {
  test("writes the token, the cart, the sender's account and the date", async () => {
    const { store, calls } = fakeStore()

    const share = await createShare(store, {
      accountId: ALICE,
      cartId: ALICE_CART,
      now: NOW,
      newToken: () => TOKEN_A,
    })

    expect(calls.create).toEqual([
      {
        share_token: TOKEN_A,
        cart_id: ALICE_CART,
        account_id: ALICE,
        shared_at: "2026-10-05T09:00:00.000Z",
      },
    ])
    expect(share).toMatchObject({ share_token: TOKEN_A, account_id: ALICE })
  })

  test("makes a new token for each share of the same cart", async () => {
    const { store, entries } = fakeStore()

    await createShare(store, { accountId: ALICE, cartId: ALICE_CART })
    await createShare(store, { accountId: ALICE, cartId: ALICE_CART })

    expect(entries).toHaveLength(2)
    expect(entries[0]!.share_token).not.toBe(entries[1]!.share_token)
  })

  test("refuses an unsafe account id or cart id and writes nothing", async () => {
    const { store, calls } = fakeStore()

    await expect(
      createShare(store, { accountId: "", cartId: ALICE_CART }),
    ).rejects.toThrow(UnsafeIdentifierError)
    await expect(
      createShare(store, { accountId: ALICE, cartId: "a),b(" }),
    ).rejects.toThrow(UnsafeIdentifierError)
    expect(calls.create).toEqual([])
  })
})

describe("listShares", () => {
  test("asks the API only for the signed-in account's shares", async () => {
    const { store, calls } = fakeStore()

    await listShares(store, ALICE)

    expect(calls.list).toEqual([`eq(account_id,${ALICE})`])
  })

  test("returns only the signed-in account's shares", async () => {
    const { store } = fakeStore([
      entry({ id: "e1", account_id: ALICE }),
      entry({ id: "e2", account_id: BOB, share_token: TOKEN_B }),
    ])

    const shares = await listShares(store, ALICE)

    expect(shares.map((s) => s.id)).toEqual(["e1"])
  })

  test("drops another account's share even if the API ignores the filter", async () => {
    const ignoresFilter: ShareStore = {
      ...fakeStore().store,
      list: async () => [
        entry({ id: "e1", account_id: ALICE }),
        entry({ id: "e2", account_id: BOB }),
      ],
    }

    const shares = await listShares(ignoresFilter, ALICE)

    expect(shares.map((s) => s.id)).toEqual(["e1"])
  })

  test("lists the newest share first", async () => {
    const { store } = fakeStore([
      entry({ id: "old", shared_at: "2026-10-01T09:00:00.000Z" }),
      entry({ id: "new", shared_at: "2026-10-04T09:00:00.000Z" }),
    ])

    const shares = await listShares(store, ALICE)

    expect(shares.map((s) => s.id)).toEqual(["new", "old"])
  })

  test("refuses an unsafe account id before calling the store", async () => {
    const { store, calls } = fakeStore()

    await expect(listShares(store, "")).rejects.toThrow(UnsafeIdentifierError)
    expect(calls.list).toEqual([])
  })
})

describe("revokeShare", () => {
  test("removes the signed-in account's share", async () => {
    const { store, entries } = fakeStore([entry({ id: "e1" })])

    const result = await revokeShare(store, ALICE, "e1")

    expect(result).toEqual({ removed: true })
    expect(entries).toEqual([])
  })

  test("reads the entry and compares owners before removing", async () => {
    const { store, calls, entries } = fakeStore([
      entry({ id: "e1", account_id: BOB }),
    ])

    const result = await revokeShare(store, ALICE, "e1")

    expect(result).toEqual({ removed: false, reason: "not_found" })
    expect(calls.remove).toEqual([])
    expect(entries).toHaveLength(1)
  })

  test("answers the same for a share that does not exist and one that is someone else's", async () => {
    const { store } = fakeStore([entry({ id: "theirs", account_id: BOB })])

    const foreign = await revokeShare(store, ALICE, "theirs")
    const missing = await revokeShare(store, ALICE, "nope")

    expect(foreign).toEqual(missing)
  })

  test("treats a malformed entry id as not found without calling the store", async () => {
    const { store, calls } = fakeStore([entry({ id: "e1" })])

    const result = await revokeShare(
      store,
      ALICE,
      `e1"),eq(account_id,${ALICE}`,
    )

    expect(result).toEqual({ removed: false, reason: "not_found" })
    expect(calls.remove).toEqual([])
  })

  test("refuses an unsafe account id", async () => {
    const { store } = fakeStore([entry({ id: "e1" })])

    await expect(revokeShare(store, "", "e1")).rejects.toThrow(
      UnsafeIdentifierError,
    )
  })
})

describe("findShareByToken", () => {
  test("finds the share a token names, whoever made it", async () => {
    const { store, calls } = fakeStore([
      entry({ id: "alice", share_token: TOKEN_A }),
      entry({ id: "bob", account_id: BOB, share_token: TOKEN_B }),
    ])

    const found = await findShareByToken(store, TOKEN_B)

    expect(found?.id).toBe("bob")
    expect(calls.list).toEqual([`eq(share_token,${TOKEN_B})`])
  })

  test("returns null for a token no share holds", async () => {
    const { store } = fakeStore([entry()])

    expect(await findShareByToken(store, TOKEN_B)).toBeNull()
  })

  test("returns null for a malformed token without calling the store", async () => {
    const { store, calls } = fakeStore([entry()])

    expect(await findShareByToken(store, "short")).toBeNull()
    expect(await findShareByToken(store, `${TOKEN_A}),ge(id,0`)).toBeNull()
    expect(calls.list).toEqual([])
  })

  test("returns null when the API ignores the filter and returns other shares", async () => {
    const ignoresFilter: ShareStore = {
      ...fakeStore().store,
      list: async () => [entry({ share_token: TOKEN_A })],
    }

    expect(await findShareByToken(ignoresFilter, TOKEN_B)).toBeNull()
  })

  test("a revoked share is no longer found", async () => {
    const { store } = fakeStore([entry({ id: "e1" })])

    await revokeShare(store, ALICE, "e1")

    expect(await findShareByToken(store, TOKEN_A)).toBeNull()
  })
})
