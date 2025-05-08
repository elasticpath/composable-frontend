import { getByContextAllProducts, Product } from "@epcc-sdk/sdks-shopper"
import { cookies } from "next/headers"
import Link from "next/link"
import { isAccountMemberAuthenticated } from "../lib/auth"
import { configureClient } from "../lib/api-client"

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
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md font-medium"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto bg-white p-6 rounded shadow-sm">
        <div className="mb-6 border-b border-gray-300 pb-3">
          <h2 className="text-xl font-medium mb-2 text-black">
            Authentication Demo
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

        <div>
          <h2 className="text-lg font-medium mb-3 text-black">Product List</h2>
          {products.length === 0 ? (
            <p className="text-black">No products found.</p>
          ) : (
            <ul className="space-y-3">
              {products.map((product) => (
                <li key={product.id} className="border-b border-gray-300 pb-3">
                  <div className="text-base text-black font-medium">
                    {product.attributes?.name}
                  </div>
                  <div className="text-sm text-black">
                    SKU: {product.attributes?.sku}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
