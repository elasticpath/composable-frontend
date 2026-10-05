import Link from "next/link"
import { SavedCartActions } from "@/components/saved-cart-actions"
import { SavedCartName } from "@/components/saved-cart-name"
import { requireCartContext } from "@/lib/cart-context"
import { formatExpiryDate } from "@/lib/expiry-date"
import { listSavedCarts } from "@/lib/saved-carts"

export const dynamic = "force-dynamic"

export default async function SavedCartsPage() {
  const { port, cookieCartId } = await requireCartContext("/saved-carts")

  const savedCarts = await listSavedCarts(port, cookieCartId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">Saved carts</h1>
        <p className="mt-1 text-sm text-gray-600">
          A cart is deleted on the date shown. Changing a cart moves that date
          back.{" "}
          <Link href="/configuration" className="text-blue-600 underline">
            How long carts last
          </Link>
        </p>
      </div>

      {savedCarts.length === 0 ? (
        <p className="text-sm text-gray-600">
          You have no saved carts. Add products, then choose Save for later on
          your{" "}
          <Link href="/cart" className="text-blue-600 underline">
            cart
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded border border-gray-200 bg-white">
          {savedCarts.map((cart) => (
            <li
              key={cart.handle}
              className="flex items-center justify-between gap-4 p-4"
            >
              <div>
                <SavedCartName handle={cart.handle} name={cart.name} />
                <p className="text-xs text-gray-500">
                  {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="text-right text-sm">
                <p>{cart.total}</p>
                <p className="text-xs text-gray-500">
                  Expires {formatExpiryDate(cart.expiresAt)}
                </p>
              </div>
              <SavedCartActions handle={cart.handle} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
