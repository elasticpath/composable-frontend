import Link from "next/link"
import { redirect } from "next/navigation"
import { readGuestCart } from "@/lib/cart"
import { envRequirementProblems } from "@/lib/store-requirements"

export const dynamic = "force-dynamic"

export default async function CartPage() {
  if (envRequirementProblems(process.env).length > 0) {
    redirect("/configuration-error")
  }

  const cart = await readGuestCart()

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">Cart</h1>

      {cart === null ? (
        <p role="alert" className="text-sm text-red-700">
          The cart could not be read from the store. Try again in a moment.
        </p>
      ) : cart.lines.length === 0 ? (
        <p className="text-sm text-gray-600">
          Your cart is empty.{" "}
          <Link href="/" className="text-blue-600 underline">
            Choose a product
          </Link>
          .
        </p>
      ) : (
        <div className="rounded border border-gray-200 bg-white">
          <ul className="divide-y divide-gray-200">
            {cart.lines.map((line) => (
              <li
                key={line.id}
                className="flex flex-wrap items-baseline justify-between gap-2 p-4"
              >
                <div>
                  <p className="font-medium">{line.name}</p>
                  <p className="text-xs text-gray-500">{line.sku}</p>
                </div>
                <p className="text-sm tabular-nums">
                  {line.seats} {line.seats === 1 ? "seat" : "seats"} ×{" "}
                  {line.unitPrice} ={" "}
                  <span className="font-semibold">{line.lineTotal}</span>
                </p>
              </li>
            ))}
          </ul>
          {cart.total ? (
            <p className="flex justify-between border-t border-gray-200 p-4 font-medium">
              <span>Total</span>
              <span className="tabular-nums">{cart.total}</span>
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}
