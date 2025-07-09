import {
  getByContextAllProducts,
  Product,
  ElasticPathFile,
  extractProductImage,
} from "@epcc-sdk/sdks-shopper"
import ProductCard from "./components/ProductCard"
import PaginationControls from "./components/PaginationControls"
import { configureClient } from "../lib/client"

// Configure the SDK client once when this module loads
// This ensures all SDK functions in this file use the proper configuration
configureClient()

type Props = {
  searchParams: Promise<{
    page?: string
    limit?: string
  }>
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams
  const page = parseInt(params.page || "1", 10)
  const limit = parseInt(params.limit || "20", 10)

  // Ensure page is at least 1 and limit is within reasonable bounds
  const validPage = Math.max(1, isNaN(page) ? 1 : page)
  const validLimit = Math.min(Math.max(1, isNaN(limit) ? 20 : limit), 100)

  const response = await getByContextAllProducts({
    query: {
      // @ts-ignore until the SDK is updated with the correct main_image string
      include: ["main_image"],
      "page[limit]": BigInt(validLimit),
      "page[offset]": BigInt((validPage - 1) * validLimit),
    },
  })

  const products: Product[] = response.data?.data || []
  const productMainImages: ElasticPathFile[] =
    response.data?.included?.main_images || []
  const isAuthenticated = products.length > 0

  // Extract pagination metadata
  const resultsInfo = response.data?.meta?.results

  // Get total count from results.total (total across all pages)
  const totalCount = Number(resultsInfo?.total) || 0
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / validLimit) : 1
  const currentPage = validPage

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
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-black">Our Products</h2>
            {totalCount > 0 && (
              <p className="text-sm text-gray-600">
                Showing {(currentPage - 1) * validLimit + 1} to{" "}
                {Math.min(currentPage * validLimit, totalCount)} of{" "}
                {totalCount} products
              </p>
            )}
          </div>

          {products.length === 0 ? (
            <p className="text-black">No products found.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    mainImage={extractProductImage(product, productMainImages)}
                  />
                ))}
              </div>

              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={validLimit}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
