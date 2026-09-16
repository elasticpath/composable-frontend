import Link from "next/link"
import { redirect } from "next/navigation"
import { getShopperSession } from "@/lib/account-session"
import { fetchPublishedProducts } from "@/lib/catalog"
import { listSavedProducts } from "@/lib/saved-list"
import { getSavedListContext } from "@/lib/saved-list-context"
import { envRequirementProblems } from "@/lib/store-requirements"
import { SaveButton } from "@/components/save-button"

export const dynamic = "force-dynamic"

export default async function Home() {
  if (envRequirementProblems(process.env).length > 0) {
    redirect("/configuration-error")
  }

  const products = await fetchPublishedProducts()

  if (products === null) {
    // The catalog is the subject of this page, so a catalog this store cannot
    // serve is a setup problem, not an empty grid.
    redirect("/configuration-error")
  }

  const session = await getShopperSession()

  // Signed-out visitors see the catalog and no list. Reading the saved list is
  // not attempted for them, so there is nothing to fail and nothing to hide.
  let savedEntryIdByProduct = new Map<string, string>()

  if (session) {
    const context = await getSavedListContext()

    if (!context.ok) {
      redirect("/configuration-error")
    }

    const saved = await listSavedProducts(context.store, context.accountId)
    savedEntryIdByProduct = new Map(
      saved.map((entry) => [entry.product_id, entry.id]),
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">Products</h1>
        <p className="mt-1 text-sm text-gray-600">
          {session
            ? "Saving a product writes a Custom API Entry stamped with your account id."
            : "Sign in to save products to your account."}
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-gray-600">
          This store&apos;s published catalog has no products yet.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between gap-4 rounded border border-gray-200 bg-white p-4"
            >
              <div>
                <p className="font-medium">{product.name}</p>
                <p className="text-xs text-gray-500">{product.sku}</p>
              </div>
              {session ? (
                <SaveButton
                  productId={product.id}
                  savedEntryId={savedEntryIdByProduct.get(product.id) ?? null}
                />
              ) : null}
            </li>
          ))}
        </ul>
      )}

      {session ? null : (
        <p className="text-sm">
          <Link href="/login" className="text-blue-600 underline">
            Sign in
          </Link>{" "}
          to start a saved list.
        </p>
      )}
    </div>
  )
}
