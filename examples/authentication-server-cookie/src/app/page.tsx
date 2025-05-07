import Image from "next/image"
import {
  getByContextAllProducts,
  client,
  AccessTokenResponse,
  ProductListData,
  Product,
} from "@epcc-sdk/sdks-shopper"
import { cookies } from "next/headers"
import { CREDENTIALS_COOKIE_KEY } from "./constants"

client.setConfig({
  baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL!,
})

client.interceptors.request.use(async (request, options) => {
  const credentials = JSON.parse(
    (await cookies()).get(CREDENTIALS_COOKIE_KEY)?.value ?? "",
  ) as AccessTokenResponse | undefined
  request.headers.set("Authorization", `Bearer ${credentials?.access_token}`)
  return request
})

export default async function Home() {
  const response = await getByContextAllProducts()
  const products: Product[] = response.data?.data || []
  const isAuthenticated = products.length > 0

  return (
    <div className="min-h-screen p-4 font-sans bg-gray-50">
      <main className="max-w-3xl mx-auto bg-white p-6 rounded shadow-sm">
        <div className="mb-6 border-b border-gray-300 pb-3">
          <h1 className="text-xl font-medium mb-2 text-black">
            Authentication Demo
          </h1>
          <p className="text-black">
            Status:{" "}
            {isAuthenticated ? (
              <span className="font-semibold text-green-800">
                Store successfully authenticated
              </span>
            ) : (
              <span className="font-semibold text-red-800">
                Not authenticated
              </span>
            )}
          </p>
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
