"use server"

import { redirect } from "next/navigation"
import { addSeatsToGuestCart, seatsInGuestCart } from "../lib/cart"
import { fetchSeatProduct } from "../lib/catalog"
import { fitsWithSeatsInCart, selectSeats } from "../lib/seat-rules"

export type AddSeatsState = { error: string } | null

export async function addSeats(
  _previous: AddSeatsState,
  formData: FormData,
): Promise<AddSeatsState> {
  const productId = formData.get("productId")
  if (typeof productId !== "string" || productId === "") {
    return { error: "No product was named. Nothing was added." }
  }

  const lookup = await fetchSeatProduct(productId)
  if (lookup.status !== "found") {
    return {
      error:
        "This product could not be read from the catalog. Nothing was added.",
    }
  }

  const selection = selectSeats(
    lookup.product.seatProduct,
    formData.get("seats"),
  )

  if (selection.overLimit) {
    return {
      error: `Orders above ${selection.limit} seats go through customer service. Nothing was added.`,
    }
  }

  if (!selection.accepted) {
    return {
      error: `Choose a whole number of seats from 1 to ${selection.limit}. Nothing was added.`,
    }
  }

  if (!selection.total) {
    return { error: "This product has no price. Nothing was added." }
  }

  const seatsAlreadyInCart = await seatsInGuestCart(productId)
  if (seatsAlreadyInCart === null) {
    return { error: "The cart could not be read. Nothing was added." }
  }

  if (!fitsWithSeatsInCart(selection, seatsAlreadyInCart)) {
    return {
      error: `Your cart already holds ${seatsAlreadyInCart} of this product's ${selection.limit} seats. Orders above ${selection.limit} seats go through customer service. Nothing was added.`,
    }
  }

  const failure = await addSeatsToGuestCart(productId, selection.seats)
  if (failure) return failure

  redirect("/cart")
}
