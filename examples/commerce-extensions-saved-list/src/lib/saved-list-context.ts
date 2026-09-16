import "server-only"

import { NextResponse } from "next/server"
import { IdentityUnavailableError, getShopperSession } from "./account-session"
import {
  createSavedListEntryStore,
  resolveSavedListCustomApiId,
} from "./commerce-extensions-store"
import { UnsafeIdentifierError, type SavedListEntryStore } from "./saved-list"

export type SavedListContext =
  | { ok: true; accountId: string; store: SavedListEntryStore }
  | { ok: false; status: 401 | 503; message: string }

export async function getSavedListContext(): Promise<SavedListContext> {
  let session

  try {
    session = await getShopperSession()
  } catch (error) {
    if (error instanceof IdentityUnavailableError) {
      return {
        ok: false,
        status: 503,
        message: "Cannot reach Elastic Path. Try again shortly.",
      }
    }
    throw error
  }

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

export function contextErrorResponse(
  context: Extract<SavedListContext, { ok: false }>,
): NextResponse {
  return NextResponse.json(
    { error: context.message },
    { status: context.status },
  )
}

export function failed(error: unknown): NextResponse {
  if (error instanceof UnsafeIdentifierError) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  console.error(error)
  return NextResponse.json({ error: "Saved list unavailable" }, { status: 500 })
}
