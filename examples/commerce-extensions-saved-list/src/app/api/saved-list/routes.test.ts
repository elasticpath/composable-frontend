import { beforeEach, describe, expect, test, vi } from "vitest"
import type { SavedListEntry, SavedListEntryStore } from "@/lib/saved-list"
import type { SavedListContext } from "@/lib/saved-list-context"

/**
 * The same cross-account checks as `saved-list.test.ts`, but driven through the
 * real route handlers, so what is proven is the reply a shopper's browser gets
 * rather than the behaviour of one function.
 *
 * Only the session is faked. Everything the routes do with it — the guard, the
 * scoping, the ownership check before a delete — is the shipped code.
 */

const ALICE = "11111111-1111-1111-1111-111111111111"
const BOB = "22222222-2222-2222-2222-222222222222"

const entries: SavedListEntry[] = []

const store: SavedListEntryStore = {
  async list(filter) {
    const match = /^eq\(account_id,(.*)\)$/.exec(filter)
    if (!match) return [...entries]
    return entries.filter((entry) => entry.account_id === match[1])
  },
  async get(entryId) {
    return entries.find((entry) => entry.id === entryId) ?? null
  },
  async create(values) {
    const created = { id: `entry-${entries.length + 1}`, ...values }
    entries.push(created)
    return created
  },
  async remove(entryId) {
    const index = entries.findIndex((entry) => entry.id === entryId)
    if (index >= 0) entries.splice(index, 1)
  },
}

/** Who the routes believe is signed in for the next call. */
let signedInAs: string | null = ALICE

vi.mock("@/lib/saved-list-context", async () => {
  const { NextResponse } = await import("next/server")

  return {
    async getSavedListContext(): Promise<SavedListContext> {
      if (!signedInAs) {
        return {
          ok: false,
          status: 401,
          message: "Sign in to use your saved list",
        }
      }
      return { ok: true, accountId: signedInAs, store }
    },
    contextErrorResponse(context: Extract<SavedListContext, { ok: false }>) {
      return NextResponse.json(
        { error: context.message },
        { status: context.status },
      )
    },
  }
})

const { GET, POST } = await import("./route")
const { DELETE } = await import("./[entryId]/route")

function post(productId: string) {
  return POST(
    new Request("http://localhost/api/saved-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    }),
  )
}

function del(entryId: string) {
  return DELETE(new Request(`http://localhost/api/saved-list/${entryId}`), {
    params: Promise.resolve({ entryId }),
  })
}

beforeEach(() => {
  entries.length = 0
  signedInAs = ALICE
})

describe("a signed-in shopper", () => {
  test("adds a product, sees it, and removes it", async () => {
    const created = await post("p-1")
    expect(created.status).toBe(201)
    const { data: entry } = await created.json()

    const listed = await GET()
    expect(listed.status).toBe(200)
    expect((await listed.json()).data).toEqual([
      { entryId: entry.entryId, productId: "p-1" },
    ])

    expect((await del(entry.entryId)).status).toBe(204)
    expect((await (await GET()).json()).data).toEqual([])
  })
})

describe("one shopper against another shopper's list", () => {
  test("cannot see it", async () => {
    await post("p-alice")

    signedInAs = BOB
    await post("p-bob")

    expect((await (await GET()).json()).data).toEqual([
      { entryId: "entry-2", productId: "p-bob" },
    ])
  })

  test("cannot delete from it, even knowing the entry id", async () => {
    await post("p-alice")
    const aliceEntryId = entries[0].id

    signedInAs = BOB
    const response = await del(aliceEntryId)

    expect(response.status).toBe(404)
    expect(entries).toHaveLength(1)
  })

  test("gets the same 404 for a real entry it does not own as for one that does not exist", async () => {
    await post("p-alice")
    const aliceEntryId = entries[0].id

    signedInAs = BOB
    const someoneElses = await del(aliceEntryId)
    const nonExistent = await del("entry-does-not-exist")

    expect(someoneElses.status).toBe(nonExistent.status)
    expect(await someoneElses.json()).toEqual(await nonExistent.json())
  })
})

describe("a signed-out visitor", () => {
  beforeEach(() => {
    signedInAs = null
  })

  test("is refused the list", async () => {
    expect((await GET()).status).toBe(401)
  })

  test("is refused a write", async () => {
    expect((await post("p-1")).status).toBe(401)
    expect(entries).toHaveLength(0)
  })

  test("is refused a delete", async () => {
    expect((await del("entry-1")).status).toBe(401)
  })
})
