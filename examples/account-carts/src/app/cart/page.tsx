import Link from "next/link"
import { requireCartContext } from "@/lib/cart-context"
import { readActiveCart } from "@/lib/cart-service"

export const dynamic = "force-dynamic"

export default async function CartPage() {
  const { port, cookieCartId } = await requireCartContext("/cart")

  const cart = await readActiveCart(port, cookieCartId)

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium">Your cart</h1>

      {cart === null || cart.lines.length === 0 ? (
        <p className="text-sm text-gray-600">
          Your cart is empty.{" "}
          <Link href="/" className="text-blue-600 underline">
            Browse products
          </Link>
        </p>
      ) : (
        <div className="rounded border border-gray-200 bg-white">
          <ul className="divide-y divide-gray-200">
            {cart.lines.map((line) => (
              <li
                key={line.id}
                className="flex items-center justify-between gap-4 p-4"
              >
                <div>
                  <p className="font-medium">{line.name}</p>
                  <p className="text-xs text-gray-500">
                    Quantity {line.quantity}
                  </p>
                </div>
                <p className="text-sm">{line.lineTotal}</p>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-gray-200 p-4 font-medium">
            <span>Total</span>
            <span>{cart.total}</span>
          </div>
        </div>
      )}
    </div>
  )
}
