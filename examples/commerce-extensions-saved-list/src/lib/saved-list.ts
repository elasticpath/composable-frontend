export type SavedListEntry = {
  id: string
  account_id: string
  product_id: string
}

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

export async function listSavedProducts(
  store: SavedListEntryStore,
  accountId: string,
): Promise<SavedListEntry[]> {
  const entries = await store.list(ownedByAccountFilter(accountId))

  return entries.filter((entry) => entry.account_id === accountId)
}

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

  return store.create({ account_id: accountId, product_id: productId })
}

export type RemoveResult =
  { removed: true } | { removed: false; reason: "not_found" }

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
