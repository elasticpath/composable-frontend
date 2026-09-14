/**
 * Account-scoped reads and writes for the saved list.
 *
 * Custom API entries have no per-entry ownership in Elastic Path. Any caller
 * whose token may list entries can list *every* shopper's entries. The
 * `account_id` custom field is the only thing that ties an entry to a shopper,
 * and nothing in the platform enforces it. Enforcing it is this module's job.
 *
 * Three rules, and every exported function keeps all three:
 *
 * 1. The account id always comes from the caller's verified session, never from
 *    anything the browser sent. It is a required first argument here so there
 *    is no code path that forgets it.
 * 2. Reads are filtered by account on the API *and* re-checked in memory, so a
 *    mis-provisioned or unfilterable field cannot leak another shopper's rows.
 * 3. Writes against an existing entry re-read it and compare owners first. An
 *    entry owned by someone else is reported as missing, so the caller cannot
 *    probe for entry ids belonging to other shoppers.
 */

export type SavedListEntry = {
  id: string
  account_id: string
  product_id: string
}

/**
 * The slice of Commerce Extensions this module needs. Keeping it this narrow
 * means the ownership rules can be tested without a store, and lets the
 * transport (see `commerce-extensions-store.ts`) stay a thin adapter.
 */
export interface SavedListEntryStore {
  list(filter: string): Promise<SavedListEntry[]>
  get(entryId: string): Promise<SavedListEntry | null>
  create(values: {
    account_id: string
    product_id: string
  }): Promise<SavedListEntry>
  remove(entryId: string): Promise<void>
}

export class UnsafeIdentifierError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UnsafeIdentifierError"
  }
}

/**
 * Elastic Path filter values are not escaped, so a value carrying `,` `(` or
 * `)` would change the shape of the filter rather than be compared by it.
 * Account ids are UUIDs; anything else is rejected rather than sent.
 */
const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/

function assertSafeAccountId(accountId: string): void {
  if (!SAFE_ID.test(accountId)) {
    throw new UnsafeIdentifierError(
      "Refusing to build a filter from an account id that is empty or contains filter syntax",
    )
  }
}

export function ownedByAccountFilter(accountId: string): string {
  assertSafeAccountId(accountId)
  return `eq(account_id,${accountId})`
}

/**
 * Every saved entry belonging to `accountId`, and nothing else.
 */
export async function listSavedProducts(
  store: SavedListEntryStore,
  accountId: string,
): Promise<SavedListEntry[]> {
  const entries = await store.list(ownedByAccountFilter(accountId))

  // The filter above is the API doing the work. This is the same check done
  // again locally, because a Custom API whose `account_id` field is missing or
  // not filterable would otherwise return the whole store.
  return entries.filter((entry) => entry.account_id === accountId)
}

/**
 * Saves `productId` for `accountId`. Saving twice is not an error and does not
 * create a second entry.
 */
export async function saveProduct(
  store: SavedListEntryStore,
  accountId: string,
  productId: string,
): Promise<SavedListEntry> {
  if (!SAFE_ID.test(productId)) {
    throw new UnsafeIdentifierError("Product id is empty or malformed")
  }

  const existing = await listSavedProducts(store, accountId)
  const alreadySaved = existing.find((entry) => entry.product_id === productId)

  if (alreadySaved) {
    return alreadySaved
  }

  // `account_id` is stamped from the session. There is deliberately no way for
  // a caller to supply it.
  return store.create({ account_id: accountId, product_id: productId })
}

export type RemoveResult =
  { removed: true } | { removed: false; reason: "not_found" }

/**
 * Removes one entry, but only if `accountId` owns it.
 *
 * An entry owned by another account gives the same answer as an entry that does
 * not exist. Distinguishing them would turn this route into an oracle for which
 * entry ids are real.
 */
export async function removeSavedProduct(
  store: SavedListEntryStore,
  accountId: string,
  entryId: string,
): Promise<RemoveResult> {
  assertSafeAccountId(accountId)

  if (!SAFE_ID.test(entryId)) {
    return { removed: false, reason: "not_found" }
  }

  const entry = await store.get(entryId)

  if (!entry || entry.account_id !== accountId) {
    return { removed: false, reason: "not_found" }
  }

  await store.remove(entryId)
  return { removed: true }
}
