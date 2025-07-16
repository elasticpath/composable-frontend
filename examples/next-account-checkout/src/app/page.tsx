import { getByContextAllProducts, Product } from "@epcc-sdk/sdks-shopper"
import { cookies } from "next/headers"
import Link from "next/link"
import { isAccountMemberAuthenticated } from "../lib/auth"
import { configureClient } from "../lib/api-client"
import { HomePageContent } from "../components/home-page-content"

configureClient()

export default async function Home() {
  const response = await getByContextAllProducts()
  const products: Product[] = response.data?.data || []
  const isStoreAuthenticated = products.length > 0

  const cookieStore = await cookies()
  const isUserAuthenticated = isAccountMemberAuthenticated(cookieStore)

  return (
    <div className="min-h-full bg-white">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6 border-b border-gray-300 pb-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-medium mb-2 text-black">
              Account Checkout Demo (Next.js)
            </h1>
            <div className="mt-3 space-x-4">
              {isUserAuthenticated ? (
                <Link
                  href="/account"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  My Account
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-black">
              Store Status:{" "}
              {isStoreAuthenticated ? (
                <span className="font-semibold text-green-600">
                  Storefront successfully authenticated
                </span>
              ) : (
                <span className="font-semibold text-red-600">
                  Storefront not authenticated
                </span>
              )}
            </p>
            <p className="text-black">
              User Status:{" "}
              {isUserAuthenticated ? (
                <span className="font-semibold text-green-600">
                  User is signed in
                </span>
              ) : (
                <span className="font-semibold text-red-600">
                  No user signed in
                </span>
              )}
            </p>
          </div>
        </div>

        <HomePageContent
          products={products}
          isUserAuthenticated={isUserAuthenticated}
        />
      </div>
    </div>
  )
}
