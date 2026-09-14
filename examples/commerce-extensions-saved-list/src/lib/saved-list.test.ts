import { describe, expect, test } from "vitest"
import {
  UnsafeIdentifierError,
  listSavedProducts,
  ownedByAccountFilter,
  removeSavedProduct,
  saveProduct,
  type SavedListEntry,
  type SavedListEntryStore,
} from "./saved-list"

const ALICE = "11111111-1111-1111-1111-111111111111"
const BOB = "22222222-2222-2222-2222-222222222222"

/**
 * A stand-in for Commerce Extensions that behaves the way the real one does:
 * entries carry an `account_id` field but the API enforces nothing about it,
 * and `get` by id will happily return an entry belonging to anybody.
 */
function fakeStore(seed: SavedListEntry[] = []) {
  const entries = [...seed]
  const calls = {
    list: [] as string[],
    create: [] as { account_id: string; product_id: string }[],
    remove: [] as string[],
  }

  const store: SavedListEntryStore = {
    async list(filter) {
      calls.list.push(filter)
      const match = /^eq\(account_id,(.*)\)$/.exec(filter)
      if (!match) {
        return [...entries]
      }
      return entries.filter((entry) => entry.account_id === match[1])
    },
    async get(entryId) {
      return entries.find((entry) => entry.id === entryId) ?? null
    },
    async create(values) {
      const created = { id: `entry-${entries.length + 1}`, ...values }
      calls.create.push(values)
      entries.push(created)
      return created
    },
    async remove(entryId) {
      calls.remove.push(entryId)
      const index = entries.findIndex((entry) => entry.id === entryId)
      if (index >= 0) entries.splice(index, 1)
    },
  }

  return { store, calls, entries }
}

describe("ownedByAccountFilter", () => {
  test("scopes the query to one account", () => {
    expect(ownedByAccountFilter(ALICE)).toBe(`eq(account_id,${ALICE})`)
  })

  test("refuses an empty account id rather than matching every entry", () => {
    expect(() => ownedByAccountFilter("")).toThrow(UnsafeIdentifierError)
  })

  test("refuses an account id carrying filter syntax", () => {
    expect(() => ownedByAccountFilter(`${ALICE}),ge(created_at,0`)).toThrow(
      UnsafeIdentifierError,
    )
  })
})

describe("listSavedProducts", () => {
  test("asks the API only for the signed-in account's entries", async () => {
    const { store, calls } = fakeStore()

    await listSavedProducts(store, ALICE)

    expect(calls.list).toEqual([`eq(account_id,${ALICE})`])
  })

  test("returns only the signed-in account's entries", async () => {
    const { store } = fakeStore([
      { id: "e1", account_id: ALICE, product_id: "p-alice" },
      { id: "e2", account_id: BOB, product_id: "p-bob" },
    ])

    const saved = await listSavedProducts(store, ALICE)

    expect(saved.map((entry) => entry.product_id)).toEqual(["p-alice"])
  })

  test("drops another account's entries even when the API ignores the filter", async () => {
    const leaky: SavedListEntryStore = {
      // A Custom API whose account_id field cannot be filtered on answers with
      // every entry in the store. The caller must still see only its own.
      async list() {
        return [
          { id: "e1", account_id: ALICE, product_id: "p-alice" },
          { id: "e2", account_id: BOB, product_id: "p-bob" },
        ]
      },
      async get() {
        return null
      },
      async create() {
        throw new Error("not used")
      },
      async remove() {
        throw new Error("not used")
      },
    }

    const saved = await listSavedProducts(leaky, ALICE)

    expect(saved).toEqual([
      { id: "e1", account_id: ALICE, product_id: "p-alice" },
    ])
  })
})

describe("saveProduct", () => {
  test("stamps the entry with the signed-in account", async () => {
    const { store, calls } = fakeStore()

    await saveProduct(store, ALICE, "p-1")

    expect(calls.create).toEqual([{ account_id: ALICE, product_id: "p-1" }])
  })

  test("saving the same product twice does not create a second entry", async () => {
    const { store, calls } = fakeStore()

    const first = await saveProduct(store, ALICE, "p-1")
    const second = await saveProduct(store, ALICE, "p-1")

    expect(second).toEqual(first)
    expect(calls.create).toHaveLength(1)
  })

  test("two accounts saving the same product get separate entries", async () => {
    const { store, entries } = fakeStore()

    await saveProduct(store, ALICE, "p-1")
    await saveProduct(store, BOB, "p-1")

    expect(entries).toHaveLength(2)
    expect(entries.map((entry) => entry.account_id).sort()).toEqual(
      [ALICE, BOB].sort(),
    )
  })

  test("refuses to write without an account id", async () => {
    const { store } = fakeStore()

    await expect(saveProduct(store, "", "p-1")).rejects.toThrow(
      UnsafeIdentifierError,
    )
  })
})

describe("removeSavedProduct", () => {
  test("removes an entry the account owns", async () => {
    const { store, calls } = fakeStore([
      { id: "e1", account_id: ALICE, product_id: "p-alice" },
    ])

    const result = await removeSavedProduct(store, ALICE, "e1")

    expect(result).toEqual({ removed: true })
    expect(calls.remove).toEqual(["e1"])
  })

  test("will not remove an entry belonging to another account", async () => {
    const { store, calls, entries } = fakeStore([
      { id: "e1", account_id: ALICE, product_id: "p-alice" },
      { id: "e2", account_id: BOB, product_id: "p-bob" },
    ])

    // Alice knows Bob's entry id and asks for it by hand.
    const result = await removeSavedProduct(store, ALICE, "e2")

    expect(result).toEqual({ removed: false, reason: "not_found" })
    expect(calls.remove).toEqual([])
    expect(entries).toHaveLength(2)
  })

  test("another account's entry is indistinguishable from one that does not exist", async () => {
    const { store } = fakeStore([
      { id: "e2", account_id: BOB, product_id: "p-bob" },
    ])

    const someoneElses = await removeSavedProduct(store, ALICE, "e2")
    const nonExistent = await removeSavedProduct(store, ALICE, "e404")

    expect(someoneElses).toEqual(nonExistent)
  })

  test("refuses to act without an account id", async () => {
    const { store } = fakeStore([
      { id: "e1", account_id: ALICE, product_id: "p-alice" },
    ])

    await expect(removeSavedProduct(store, "", "e1")).rejects.toThrow(
      UnsafeIdentifierError,
    )
  })
})
