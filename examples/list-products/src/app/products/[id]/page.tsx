import {
  getByContextProduct,
  extractProductImage,
} from "@epcc-sdk/sdks-shopper"
import Image from "next/image"
import Link from "next/link"
import { configureClient } from "../../../lib/client"
import { notFound } from "next/navigation"
import { Metadata, ResolvingMetadata } from "next"
import {
  ProductPrice,
  getPriceStructuredData,
  MultiLocationInventory,
} from "../../components"
import {
  fetchInventoryLocations,
  fetchProductStock,
  getStructuredDataAvailability,
} from "../../../lib/inventory"

// Configure the SDK client once when this module loads
// This ensures all SDK functions in this file use the proper configuration
configureClient()

type Props = {
  params: { id: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // Fetch product data
  const response = await getByContextProduct({
    path: { product_id: (await params).id },
    // @ts-ignore
    query: { include: ["main_image"] },
  })

  if (!response.data) {
    return {
      title: "Product Not Found",
    }
  }

  const product = response.data.data!
  const mainImage = extractProductImage(
    product,
    response.data.included?.main_images || [],
  )
  const name = product.attributes?.name || "Unnamed Product"
  const description =
    product.attributes?.description || "No description available"
  const imageUrl = mainImage?.link?.href || "/placeholder.jpg"

  return {
    title: name,
    description: description,
    openGraph: {
      title: name,
      description: description,
      images: [imageUrl],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: description,
      images: [imageUrl],
    },
  }
}

export default async function ProductPage({ params }: Props) {
  const response = await getByContextProduct({
    path: { product_id: (await params).id },
    // @ts-ignore
    query: { include: ["main_image"] },
  })

  if (!response.data) {
    notFound()
  }

  const product = response.data.data!
  const mainImage = extractProductImage(
    product,
    response.data.included?.main_images || [],
  )
  const name = product.attributes?.name || "Unnamed Product"
  const description =
    product.attributes?.description || "No description available"
  const sku = product.attributes?.sku || "No SKU"
  const imageUrl = mainImage?.link?.href || "/placeholder.jpg"

  // Extract pricing information
  const priceData = product.meta?.display_price?.without_tax as any

  // Enhance price data with original price if available
  if (priceData && product.meta?.original_price) {
    priceData.original_price = product.meta.original_price.without_tax?.amount
  }

  // Fetch multi-location inventory data in parallel for better performance
  // This demonstrates how to handle real-time inventory across multiple locations
  const [inventoryLocations, productStock] = await Promise.all([
    fetchInventoryLocations(), // Gets all warehouse/store locations
    fetchProductStock(product.id!), // Gets live stock levels with location breakdown
  ])

  // Create structured data for SEO (JSON-LD format)
  // This helps search engines understand the product information
  // and can enable rich snippets in search results
  const productJsonLd: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    sku,
    image: imageUrl,
  }

  // Add price and stock information to structured data if available
  // This enables rich product information in search results
  const priceStructuredData = getPriceStructuredData(priceData)
  if (priceStructuredData) {
    // Use aggregate stock for structured data (not location-specific)
    const stockAvailability = productStock
      ? getStructuredDataAvailability({
          available: productStock.attributes.available,
          allocated: productStock.attributes.allocated,
          total: productStock.attributes.total,
        })
      : "https://schema.org/OutOfStock"

    productJsonLd.offers = {
      ...priceStructuredData,
      availability: stockAvailability,
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="min-h-screen p-4 font-sans bg-gray-50">
        <main className="max-w-5xl mx-auto bg-white p-6 rounded shadow-sm">
          <Link
            href="/"
            className="inline-block mb-6 text-blue-600 hover:underline"
          >
            &larr; Back to products
          </Link>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative h-96 overflow-hidden rounded-lg">
              <Image
                src={imageUrl}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-contain"
              />
            </div>

            <div>
              <h1 className="text-3xl font-semibold mb-2 text-black">{name}</h1>
              <p className="text-sm text-gray-500 mb-4">SKU: {sku}</p>

              {/* Display price and inventory information */}
              <div className="mt-4 mb-4">
                <ProductPrice priceData={priceData} />
                <MultiLocationInventory
                  stock={productStock}
                  locations={inventoryLocations}
                  className="text-sm mt-1"
                />
              </div>

              <div className="mt-6">
                <h2 className="text-xl text-gray-600 font-medium mb-2">
                  Description
                </h2>
                <p className="text-gray-700">{description}</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}
