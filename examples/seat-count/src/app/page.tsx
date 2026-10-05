import Link from "next/link"
import { redirect } from "next/navigation"
import { fetchSeatProducts } from "@/lib/catalog"
import { selectSeats } from "@/lib/seat-rules"
import { envRequirementProblems } from "@/lib/store-requirements"

export const dynamic = "force-dynamic"

export default async function Home() {
  if (envRequirementProblems(process.env).length > 0) {
    redirect("/configuration-error")
  }

  const products = await fetchSeatProducts()

  if (products === null) {
    redirect("/configuration-error")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium">Products sold by the seat</h1>
        <p className="mt-1 text-sm text-gray-600">
          Each product&apos;s seat limit comes from its{" "}
          <code className="font-mono">shopper_attributes.max_seats</code>, or 20
          when it has none.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-gray-600">
          This store&apos;s published catalog has no standard products with a
          price yet.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => {
            const { limit, total } = selectSeats(product.seatRulesInput, 1)

            return (
              <li key={product.id}>
                <Link
                  href={`/products/${product.id}`}
                  className="block rounded border border-gray-200 bg-white p-4 hover:border-blue-400"
                >
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sku}</p>
                  <p className="mt-2 text-sm">
                    {total?.formatted} per seat · up to {limit} seats
                  </p>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
