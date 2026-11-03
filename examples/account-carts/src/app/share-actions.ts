"use server"

import { revalidatePath } from "next/cache"
import { requireCartContext } from "@/lib/cart-context"
import { toCartHandle } from "@/lib/saved-carts"
import { shareSavedCart } from "@/lib/shared-carts"
import { revokeShare } from "@/lib/shares"
import type { ShareUnavailableReason } from "@/lib/messages"
import { SharesUnavailableError, openShareStore } from "@/lib/shares-store"

export type ShareCartResult =
  | { status: "shared" }
  | { status: "not-found" }
  | { status: "unavailable"; reason: ShareUnavailableReason }
  | { status: "failed" }

export type RevokeShareResult =
  | { status: "revoked" }
  | { status: "unavailable"; reason: ShareUnavailableReason }
  | { status: "failed" }

function unavailableOrFailed(error: unknown) {
  if (error instanceof SharesUnavailableError) {
    return { status: "unavailable", reason: error.reason } as const
  }

  console.error(error)
  return { status: "failed" } as const
}

export async function shareCart(handle: string): Promise<ShareCartResult> {
  const { accountId, port, cookieCartId } =
    await requireCartContext("/saved-carts")

  let result
  try {
    result = await shareSavedCart(port, await openShareStore(), {
      accountId,
      cookieCartId,
      handle: toCartHandle(handle),
    })
  } catch (error) {
    return unavailableOrFailed(error)
  }

  if (result.status === "not-found") {
    return result
  }

  revalidatePath("/saved-carts")

  return { status: "shared" }
}

export async function revokeShareLink(
  entryId: string,
): Promise<RevokeShareResult> {
  const { accountId } = await requireCartContext("/saved-carts")

  let result
  try {
    result = await revokeShare(await openShareStore(), accountId, entryId)
  } catch (error) {
    return unavailableOrFailed(error)
  }

  revalidatePath("/saved-carts")

  return { status: "revoked" }
}
