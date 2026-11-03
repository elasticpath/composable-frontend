import Link from "next/link"
import { redirect } from "next/navigation"
import { getShopperSession } from "@/lib/account-session"
import { fetchProductsByIds } from "@/lib/catalog"
import { listSavedProducts } from "@/lib/saved-list"
import { getSavedListContext } from "@/lib/saved-list-context"
import { SaveButton } from "@/components/save-button"

export const dynamic = "force-dynamic"

export default async function SavedList() {
  const session = await getShopperSession()

  if (!session) {
    redirect("/login?returnUrl=/saved-list")
  }

  const context = await getSavedListContext()

  if (!context.ok) {
    redirect("/configuration-error")
  }

  const entries = await listSavedProducts(context.store, context.accountId)
  const products = await fetchProductsByIds(
    entries.map((entry) => entry.product_id),
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">Your saved list</h1>
        <p className="mt-1 text-sm text-gray-600">
          Account {session.accountName || session.accountId}
        </p>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-600">
          Nothing saved yet.{" "}
          <Link href="/" className="text-blue-600 underline">
            Browse products
          </Link>
          .
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry) => {
            const product = products.get(entry.product_id)

            return (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-4 rounded border border-gray-200 bg-white p-4"
              >
                <div>
                  <p className="font-medium">
                    {product?.name ?? "Product no longer available"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product?.sku ?? entry.product_id}
                  </p>
                </div>
                <SaveButton
                  productId={entry.product_id}
                  savedEntryId={entry.id}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
