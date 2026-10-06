import { redirect } from "next/navigation"
import { requireCartContext } from "@/lib/cart-context"
import { fetchListableProducts } from "@/lib/catalog"
import { AddToCartButton } from "@/components/add-to-cart-button"

export const dynamic = "force-dynamic"

export default async function Home() {
  await requireCartContext("/")

  const products = await fetchListableProducts()

  if (products === null) {
    redirect("/configuration-error")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">Products</h1>
        <p className="mt-1 text-sm text-gray-600">
          Adding a product puts it in your account&apos;s active cart, so it is
          there when you sign in on another browser.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-gray-600">
          This store&apos;s published catalog has no standard, priced products
          yet.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between gap-4 rounded border border-gray-200 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="wrap-anywhere font-medium">{product.name}</p>
                <p className="wrap-anywhere text-xs text-gray-500">
                  {product.sku}
                </p>
                <p className="mt-1 text-sm">{product.price}</p>
              </div>
              <AddToCartButton productId={product.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
