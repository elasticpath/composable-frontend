"use server"

import { revalidatePath } from "next/cache"
import { setActiveCartCookie } from "@/lib/active-cart-cookie"
import { requireCartContext } from "@/lib/cart-context"
import { describeFailure, type CartAction } from "@/lib/cart-failure"
import { CART_GONE_MESSAGE } from "@/lib/messages"
import {
  deleteSavedCart,
  renameSavedCart,
  resumeSavedCart,
} from "@/lib/manage-saved-cart"
import { toCartHandle } from "@/lib/saved-carts"

export type FailedResult = { status: "failed"; message: string }

export type RenameSavedCartResult =
  | { status: "renamed"; name: string }
  | FailedResult

export type DeleteSavedCartResult = { status: "deleted" } | FailedResult

export type ResumeSavedCartResult = { status: "resumed" } | FailedResult

const SAVED_CARTS_PATH = "/saved-carts"

function failed(error: unknown, action: CartAction): FailedResult {
  console.error(error)
  return { status: "failed", message: describeFailure(error, action) }
}

function revalidateCartPages() {
  revalidatePath("/cart")
  revalidatePath(SAVED_CARTS_PATH)
}

export async function renameSavedCartAction(
  handle: string,
  requestedName: string,
): Promise<RenameSavedCartResult> {
  const { port } = await requireCartContext(SAVED_CARTS_PATH)

  let result
  try {
    result = await renameSavedCart(port, toCartHandle(handle), requestedName)
  } catch (error) {
    return failed(error, "rename")
  }

  if (result.status === "invalid-name") {
    return { status: "failed", message: result.problem }
  }
  if (result.status === "not-found") {
    return { status: "failed", message: CART_GONE_MESSAGE }
  }

  revalidateCartPages()

  return { status: "renamed", name: result.name }
}

export async function deleteSavedCartAction(
  handle: string,
): Promise<DeleteSavedCartResult> {
  const { port } = await requireCartContext(SAVED_CARTS_PATH)

  let result
  try {
    result = await deleteSavedCart(port, toCartHandle(handle))
  } catch (error) {
    return failed(error, "delete")
  }

  if (result.status === "not-found") {
    return { status: "failed", message: CART_GONE_MESSAGE }
  }

  if (result.activeCartId) {
    await setActiveCartCookie(result.activeCartId)
  }

  revalidateCartPages()

  return { status: "deleted" }
}

export async function resumeSavedCartAction(
  handle: string,
): Promise<ResumeSavedCartResult> {
  const { port } = await requireCartContext(SAVED_CARTS_PATH)

  let result
  try {
    result = await resumeSavedCart(port, toCartHandle(handle))
  } catch (error) {
    return failed(error, "resume")
  }

  if (result.status === "not-found") {
    return { status: "failed", message: CART_GONE_MESSAGE }
  }

  await setActiveCartCookie(result.cartId)

  revalidateCartPages()

  return { status: "resumed" }
}
