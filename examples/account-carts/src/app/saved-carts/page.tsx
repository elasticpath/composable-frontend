import Link from "next/link"
import { ShareCartButton } from "@/components/share-cart-button"
import { ShareLinks } from "@/components/share-links"
import { SavedCartActions } from "@/components/saved-cart-actions"
import { SavedCartName } from "@/components/saved-cart-name"
import { requireCartContext } from "@/lib/cart-context"
import { formatExpiryDate } from "@/lib/expiry-date"
import { listSavedCarts } from "@/lib/saved-carts"

export const dynamic = "force-dynamic"

export default async function SavedCartsPage() {
  const { accountId, port, cookieCartId } =
    await requireCartContext("/saved-carts")

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
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 p-4"
            >
              <div className="min-w-0 wrap-anywhere">
                <SavedCartName handle={cart.handle} name={cart.name} />
                <p className="text-xs text-gray-500">
                  {cart.itemCount} {cart.itemCount === 1 ? "item" : "items"}
                </p>
              </div>
              <div className="text-right text-sm">
                {cart.total ? <p>{cart.total}</p> : null}
                <p className="text-xs text-gray-500">
                  Expires {formatExpiryDate(cart.expiresAt)}
                </p>
              </div>
              <div className="flex min-w-0 flex-wrap items-start gap-2">
                <SavedCartActions handle={cart.handle} />
                <ShareCartButton handle={cart.handle} />
              </div>
            </li>
          ))}
        </ul>
      )}

      <ShareLinks port={port} accountId={accountId} />
    </div>
  )
}
