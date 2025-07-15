import { getByContextAllProducts, Product } from "@epcc-sdk/sdks-shopper"
import { cookies } from "next/headers"
import Link from "next/link"
import { isAccountMemberAuthenticated } from "../lib/auth"
import { configureClient } from "../lib/api-client"
import { ProductGrid } from "../components/product-grid"
import { CartCheckoutWrapper } from "../components/cart-checkout-wrapper"

configureClient()

export default async function Home() {
  // Configure the client for this server component

  const response = await getByContextAllProducts()
  const products: Product[] = response.data?.data || []
  const isStoreAuthenticated = products.length > 0

  const cookieStore = await cookies()
  const isUserAuthenticated = isAccountMemberAuthenticated(cookieStore)

  return (
    <div className="min-h-screen p-4 font-sans bg-gray-50">
      <header className="max-w-3xl mx-auto bg-white p-3 rounded shadow-sm mb-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Shopper Store</h1>
          <div>
            {isUserAuthenticated ? (
              <Link
                href="/account"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                My Account
              </Link>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="mb-6 bg-white p-6 rounded shadow-sm">
          <h2 className="text-xl font-medium mb-2 text-black">
            Account Checkout Demo
          </h2>
          <div className="space-y-2">
            <p className="text-black">
              Store Authentication:{" "}
              {isStoreAuthenticated ? (
                <span className="font-semibold text-green-800">
                  Store successfully authenticated
                </span>
              ) : (
                <span className="font-semibold text-red-800">
                  Not authenticated
                </span>
              )}
            </p>
            <p className="text-black">
              User Authentication:{" "}
              {isUserAuthenticated ? (
                <span className="font-semibold text-green-800">
                  User is signed in
                </span>
              ) : (
                <span className="font-semibold text-red-800">
                  No user signed in
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3 bg-white p-6 rounded shadow-sm">
            <h2 className="text-lg font-medium mb-3 text-black">
              Product List
            </h2>
            <ProductGrid products={products} />
          </div>

          <div className="lg:w-1/3">
            <CartCheckoutWrapper />
          </div>
        </div>
      </main>
    </div>
  )
}
