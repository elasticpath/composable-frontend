import {
  getByContextAllProducts,
  client,
  AccessTokenResponse,
  Product,
  ElasticPathFile,
  extractProductImage,
} from "@epcc-sdk/sdks-shopper"
import { cookies } from "next/headers"
import { CREDENTIALS_COOKIE_KEY } from "./constants"
import ProductCard from "./components/ProductCard"

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

// Add multi-location inventory support
client.interceptors.request.use(async (request, options) => {
  request.headers.set("EP-Inventories-Multi-Location", "true")
  return request
})

export default async function Home() {
  const response = await getByContextAllProducts({
    query: {
      // @ts-ignore until the SDK is updated with the correct main_image string
      include: ["main_image"],
    },
  })
  const products: Product[] = response.data?.data || []
  const productMainImages: ElasticPathFile[] =
    response.data?.included?.main_images || []
  const isAuthenticated = products.length > 0

  return (
    <div className="min-h-screen p-4 font-sans bg-gray-50">
      <main className="max-w-7xl mx-auto">
        <div className="mb-6 border-b border-gray-300 pb-3">
          <h1 className="text-2xl font-semibold mb-2 text-black">
            Products Catalog
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
          <h2 className="text-xl font-medium mb-6 text-black">Our Products</h2>
          {products.length === 0 ? (
            <p className="text-black">No products found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  mainImage={extractProductImage(product, productMainImages)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
