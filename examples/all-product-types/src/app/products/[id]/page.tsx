import {
  getByContextProduct,
  configureByContextProduct,
  extractProductImage,
  listLocations,
  getStock,
  getAllFiles,
  type ProductData,
  type ElasticPathFile,
  type BundleConfigurationData2,
} from "@epcc-sdk/sdks-shopper"
import Link from "next/link"
import { configureClient } from "../../../lib/client"
import { notFound } from "next/navigation"
import { Metadata, ResolvingMetadata } from "next"
import { getPriceStructuredData } from "../../components"
import { getStructuredDataAvailability } from "../../../lib/inventory"
import { VariationProductProvider } from "@/app/context/VariationProductProvider"
import { LocationSelectorProvider } from "@/app/context/LocationSelectorProvider"
import { DisplayStandardProduct } from "@/app/products/[id]/DisplayStandardProduct"
import { DisplayVariationProduct } from "@/app/products/[id]/DisplayVariationProduct"
import { DisplayBundleProduct } from "@/app/components/bundles/DisplayBundleProduct"
import { BundleProductProvider } from "@/app/components/bundles/BundleProductProvider"

// Configure the SDK client once when this module loads
// This ensures all SDK functions in this file use the proper configuration
configureClient()

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

async function fetchProduct({ productId }: { productId: string }) {
  return getByContextProduct({
    path: { product_id: productId },
    query: {
      include: ["main_image", "files", "component_products"],
    },
  })
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { id } = await params
  // Fetch product data with variations
  const response = await fetchProduct({ productId: id })

  const productData = response.data
  if (!productData?.data) {
    return {
      title: "Product Not Found",
    }
  }

  const mainImage = extractProductImage(
    productData.data,
    productData.included?.main_images || [],
  )
  const name = productData.data?.attributes?.name || "Unnamed Product"
  const description =
    productData.data?.attributes?.description || "No description available"
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

export default async function ProductPage({ params, searchParams }: Props) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  // Fetch product with variations included
  const activeProductPromise = fetchProduct({ productId: id })
  const listInventoryPromise = await listLocations({})

  const inventoryPromise = getStock({
    path: {
      product_uuid: id,
    },
  })

  const [activeProductResponse, inventoryLocations, inventoryResponse] =
    await Promise.all([
      activeProductPromise,
      listInventoryPromise,
      inventoryPromise,
    ])

  let activeProductData = activeProductResponse.data
  if (!activeProductData?.data) {
    notFound()
  }

  // If this is a bundle product with a config parameter, fetch the configured product
  if (
    activeProductData.data?.meta?.product_types?.[0] === "bundle" &&
    typeof resolvedSearchParams?.config === "string"
  ) {
    try {
      // Decode the config parameter
      const decodedString = atob(resolvedSearchParams.config)
      const decodedConfig = JSON.parse(decodedString)

      // Convert form format to API format
      const selectedOptions: BundleConfigurationData2["data"]["selected_options"] =
        {}

      for (const [componentKey, formOptions] of Object.entries(decodedConfig)) {
        if (Array.isArray(formOptions)) {
          selectedOptions[componentKey] = {}

          for (const optionStr of formOptions as string[]) {
            try {
              const parsed = JSON.parse(optionStr)
              // API expects number values, not BigInt
              for (const [optionId, quantity] of Object.entries(parsed)) {
                selectedOptions[componentKey][optionId] = Number(quantity) as any
              }
            } catch (e) {
              console.warn("Invalid option string:", optionStr)
            }
          }
        }
      }

      // Fetch configured product with updated pricing
      const configuredResponse = await configureByContextProduct({
        path: { product_id: id },
        query: {
          include: ["main_image", "files", "component_products"],
        },
        body: {
          data: {
            selected_options: selectedOptions,
          },
        },
      })

      if (configuredResponse.data?.data) {
        // Merge the configured product data with the original to preserve included data
        activeProductData = {
          ...activeProductData,
          data: configuredResponse.data.data,
        }
      }
    } catch (e) {
      console.warn("Failed to configure bundle product:", e)
    }
  }

  let parentProductData: ProductData | undefined
  if (activeProductData.data?.meta?.product_types?.[0] === "child") {
    const parentResponse = await fetchProduct({
      productId: activeProductData.data?.attributes?.base_product_id!,
    })

    if (!parentResponse.data?.data) {
      notFound()
    }

    parentProductData = parentResponse.data
  }

  // Fetch component image files for bundle products
  const componentProducts = activeProductData.included?.component_products
  let componentImageFiles = [] as ElasticPathFile[]
  if (componentProducts && componentProducts.length > 0) {
    const mainImageIds = componentProducts
      .map((c) => c.relationships?.main_image?.data?.id)
      .filter((id): id is string => typeof id === "string")
    if (mainImageIds.length > 0) {
      const fileResponse = await getAllFiles({
        query: {
          filter: `in(id,${mainImageIds.join(",")})`,
        },
      })
      componentImageFiles = fileResponse.data?.data ?? []
    }
  }

  let component = null
  switch (activeProductResponse.data?.data?.meta?.product_types?.[0]) {
    case "standard":
      component = (
        <LocationSelectorProvider
          initialLocations={inventoryLocations.data?.data}
        >
          <DisplayStandardProduct
            productData={activeProductData}
            inventory={inventoryResponse.data?.data}
            inventoryLocations={inventoryLocations.data?.data}
          />
        </LocationSelectorProvider>
      )
      break
    case "child":
    case "parent":
      component = (
        <LocationSelectorProvider
          initialLocations={inventoryLocations.data?.data}
        >
          <VariationProductProvider
            product={activeProductData}
            parentProduct={parentProductData}
            inventory={inventoryResponse.data?.data}
          >
            <DisplayVariationProduct
              inventoryLocations={inventoryLocations.data?.data}
              inventory={inventoryResponse.data?.data}
            />
          </VariationProductProvider>
        </LocationSelectorProvider>
      )
      break
    case "bundle":
      component = (
        <LocationSelectorProvider
          initialLocations={inventoryLocations.data?.data}
        >
          <BundleProductProvider
            product={activeProductData}
            componentImageFiles={componentImageFiles}
            inventory={inventoryResponse.data?.data}
            initialConfig={
              typeof resolvedSearchParams?.config === "string"
                ? resolvedSearchParams.config
                : undefined
            }
          >
            <DisplayBundleProduct />
          </BundleProductProvider>
        </LocationSelectorProvider>
      )
      break
    default:
      break
  }

  const productJsonLd = resolveJsonLd({
    productData: activeProductData,
    inventoryResponse,
  })

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
          {component}
        </main>
      </div>
    </>
  )
}

function resolveJsonLd({
  productData,
  inventoryResponse,
}: {
  productData: ProductData
  inventoryResponse: Awaited<ReturnType<typeof getStock>>
}) {
  const mainImage = extractProductImage(
    productData.data!,
    productData.included?.main_images || [],
  )

  const imageUrl = mainImage?.link?.href || "/placeholder.jpg"
  const name = productData.data?.attributes?.name || "Unnamed Product"
  const description =
    productData.data?.attributes?.description || "No description available"
  const sku = productData.data?.attributes?.sku || "No SKU"

  // Extract pricing information
  const priceData = productData.data?.meta?.display_price?.without_tax as any

  // Enhance price data with original price if available
  if (priceData && productData.data?.meta?.original_price) {
    priceData.original_price =
      productData.data?.meta.original_price.without_tax?.amount
  }

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
    const stockAvailability = inventoryResponse.data?.data
      ? getStructuredDataAvailability({
          available: inventoryResponse.data?.data.attributes.available,
          allocated: inventoryResponse.data?.data.attributes.allocated,
          total: inventoryResponse.data?.data.attributes.total,
        })
      : "https://schema.org/OutOfStock"

    productJsonLd.offers = {
      ...priceStructuredData,
      availability: stockAvailability,
    }
  }

  return productJsonLd
}
