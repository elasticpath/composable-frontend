import "server-only"

import { NextResponse } from "next/server"
import { getShopperSession } from "./account-session"
import {
  createSavedListEntryStore,
  resolveSavedListCustomApiId,
} from "./commerce-extensions-store"
import type { SavedListEntryStore } from "./saved-list"

export type SavedListContext =
  | { ok: true; accountId: string; store: SavedListEntryStore }
  | { ok: false; status: 401 | 503; message: string }

/**
 * Everything a saved list call needs, resolved in one place: who is asking, and
 * where their entries live.
 *
 * Route handlers start here so no route can accidentally skip the session check
 * on its way to the store.
 */
export async function getSavedListContext(): Promise<SavedListContext> {
  const session = await getShopperSession()

  if (!session) {
    return {
      ok: false,
      status: 401,
      message: "Sign in to use your saved list",
    }
  }

  const customApiId = await resolveSavedListCustomApiId()

  if (!customApiId) {
    return {
      ok: false,
      status: 503,
      message:
        "This store has no saved list Custom API. Run the provisioning script.",
    }
  }

  return {
    ok: true,
    accountId: session.accountId,
    store: createSavedListEntryStore(customApiId),
  }
}

/**
 * The one reply every route gives when it has no context to work with. Kept
 * here so a route's guard stays a single line and cannot drift.
 */
export function contextErrorResponse(
  context: Extract<SavedListContext, { ok: false }>,
): NextResponse {
  return NextResponse.json(
    { error: context.message },
    { status: context.status },
  )
}
