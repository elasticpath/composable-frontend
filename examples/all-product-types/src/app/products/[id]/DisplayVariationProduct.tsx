"use client"

import {
  extractProductImage,
  type StockResponse,
  type ProductData,
  type Location,
} from "@epcc-sdk/sdks-shopper"
import Image from "next/image"
import { LocationSelector, ProductPrice } from "../../components"
import { useLocationSelector } from "@/app/context/LocationSelectorProvider"
import DisplayInventory from "@/app/components/DisplayInventory"
import { DisplayVariations } from "@/app/components/DisplayVariations"
import { useVariationProduct } from "@/app/context/useVariationContext"

export function DisplayVariationProduct({
  inventory,
  inventoryLocations = [],
}: {
  inventory?: StockResponse
  inventoryLocations?: Array<Location>
}) {
  const { setSelectedLocation, selectedLocation } = useLocationSelector()
  const { product: productData } = useVariationProduct()

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

  return (
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

        <div className="mt-4 mb-4">
          <ProductPrice priceData={priceData} />
        </div>

        {/* Location selector for inventory */}
        {inventoryLocations.length > 0 && (
          <div className="mb-4 flex flex-col gap-4">
            <LocationSelector
              locations={inventoryLocations}
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
            />
            <DisplayInventory
              selectedLocation={selectedLocation}
              inventoryData={inventory}
            />
          </div>
        )}

        <DisplayVariations />

        <div className="mt-6">
          <h2 className="text-xl text-gray-600 font-medium mb-2">
            Description
          </h2>
          <p className="text-gray-700">{description}</p>
        </div>
      </div>
    </div>
  )
}
