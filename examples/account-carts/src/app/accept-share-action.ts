"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { setActiveCartCookie } from "@/lib/active-cart-cookie"
import { requireCartContext } from "@/lib/cart-context"
import { NOT_ANSWERING_MESSAGE } from "@/lib/cart-messages"
import { CartsUnavailableError } from "@/lib/carts-port"
import type { MergeFailure } from "@/lib/merge-failure"
import { SHARE_UNAVAILABLE_MESSAGE, acceptShare } from "@/lib/open-share"
import { shareLinkPath } from "@/lib/share-link"
import { shareSource } from "@/lib/share-source"
import { shareUnavailableMessage } from "@/lib/share-unavailable-message"
import { SharesUnavailableError } from "@/lib/shares-store"

export type AcceptShareResult =
  | { status: "already-active" }
  | { status: "failed"; failure: MergeFailure }
  | { status: "unavailable"; message: string }

function unavailable(message: string): AcceptShareResult {
  return { status: "unavailable", message }
}

export async function acceptSharedCart(
  token: string,
): Promise<AcceptShareResult> {
  const { port, cookieCartId } = await requireCartContext(
    shareLinkPath(encodeURIComponent(token)),
  )

  let result
  try {
    result = await acceptShare(port, shareSource, { token, cookieCartId })
  } catch (error) {
    if (error instanceof SharesUnavailableError) {
      return unavailable(shareUnavailableMessage(error.reason))
    }

    console.error(error)
    return unavailable(
      error instanceof CartsUnavailableError
        ? NOT_ANSWERING_MESSAGE
        : shareUnavailableMessage("unreachable"),
    )
  }

  if (result.status === "unavailable") {
    return unavailable(SHARE_UNAVAILABLE_MESSAGE)
  }

  await setActiveCartCookie(result.cartId)

  revalidatePath("/cart")
  revalidatePath("/saved-carts")

  if (result.status === "merged") {
    redirect("/cart")
  }

  if (result.status === "already-active") {
    return { status: "already-active" }
  }

  return { status: "failed", failure: result.failure }
}
