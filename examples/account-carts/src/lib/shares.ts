import { randomBytes } from "node:crypto"

export type ShareEntry = {
  id: string
  share_token: string
  cart_id: string
  account_id: string
  shared_at: string
}

export type NewShare = Omit<ShareEntry, "id">

export interface ShareStore {
  list(filter: string): Promise<ShareEntry[]>
  get(entryId: string): Promise<ShareEntry | null>
  create(values: NewShare): Promise<ShareEntry>
  remove(entryId: string): Promise<void>
}

export class UnsafeIdentifierError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "UnsafeIdentifierError"
  }
}

const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/

export const SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

export function generateShareToken(): string {
  return randomBytes(32).toString("base64url")
}

function assertSafeId(kind: string, value: string): void {
  if (!SAFE_ID.test(value)) {
    throw new UnsafeIdentifierError(
      `Refusing to use a ${kind} that is empty or contains filter syntax`,
    )
  }
}

export function ownedByAccountFilter(accountId: string): string {
  assertSafeId("account id", accountId)
  return `eq(account_id,${accountId})`
}

export function byShareTokenFilter(token: string): string {
  if (!SHARE_TOKEN_PATTERN.test(token)) {
    throw new UnsafeIdentifierError("Refusing to filter on a malformed token")
  }
  return `eq(share_token,${token})`
}

export async function createShare(
  store: ShareStore,
  {
    accountId,
    cartId,
    now = new Date(),
    newToken = generateShareToken,
  }: {
    accountId: string
    cartId: string
    now?: Date
    newToken?: () => string
  },
): Promise<ShareEntry> {
  assertSafeId("account id", accountId)
  assertSafeId("cart id", cartId)

  return store.create({
    share_token: newToken(),
    cart_id: cartId,
    account_id: accountId,
    shared_at: now.toISOString(),
  })
}

export async function listShares(
  store: ShareStore,
  accountId: string,
): Promise<ShareEntry[]> {
  const entries = await store.list(ownedByAccountFilter(accountId))

  return entries
    .filter((entry) => entry.account_id === accountId)
    .sort((a, b) => Date.parse(b.shared_at) - Date.parse(a.shared_at))
}

export type RevokeResult =
  | { removed: true }
  | { removed: false; reason: "not_found" }

export async function revokeShare(
  store: ShareStore,
  accountId: string,
  entryId: string,
): Promise<RevokeResult> {
  assertSafeId("account id", accountId)

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

export async function findShareByToken(
  store: ShareStore,
  token: string,
): Promise<ShareEntry | null> {
  if (!SHARE_TOKEN_PATTERN.test(token)) {
    return null
  }

  const entries = await store.list(byShareTokenFilter(token))

  return entries.find((entry) => entry.share_token === token) ?? null
}
