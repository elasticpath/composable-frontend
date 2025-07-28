"use client"
import { useShopperProductContext } from "../useShopperProductContext"
import React from "react"
import { StatusButton } from "../button/StatusButton"
import { useFormContext } from "react-hook-form"
import ProductComponents from "./ProductComponents"
import Image from "next/image"
import { ProductPrice } from "../ProductPrice"
import { useLocationSelector } from "@/app/context/LocationSelectorProvider"
import DisplayInventory from "../DisplayInventory"
import { useBundleProductContext } from "./BundleProductProvider"

export function DisplayBundleProduct() {
  const form = useFormContext()
  const { product, inventory, media } = useShopperProductContext()
  const { selectedLocation } = useLocationSelector()
  const { isPriceUpdating } = useBundleProductContext()

  if (!product.data) {
    return null
  }

  const watchedLocation = form.watch("location") || selectedLocation?.id || ""
  const imageUrl = media.mainImage?.link?.href || "/placeholder.jpg"
  const name = product.data?.attributes?.name || "Unnamed Product"
  const description =
    product.data?.attributes?.description || "No description available"
  const sku = product.data?.attributes?.sku || "No SKU"

  // Extract pricing information
  const priceData = product.data?.meta?.display_price?.without_tax as any

  // Enhance price data with original price if available
  if (priceData && product.data?.meta?.original_price) {
    priceData.original_price =
      product.data?.meta.original_price.without_tax?.amount
  }

  const outOfStock =
    !inventory?.attributes.locations ||
    Number(inventory.attributes.locations[watchedLocation]?.available) < 1

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
          {isPriceUpdating ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
              <span className="text-gray-600">Updating price...</span>
            </div>
          ) : (
            <ProductPrice priceData={priceData} />
          )}
        </div>

        <div className="border-t pt-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Bundle Components</h3>
          <ProductComponents />
        </div>

        {/* Location selector for inventory */}
        {inventory?.attributes.locations && (
          <div className="mb-4 flex flex-col gap-4">
            <DisplayInventory
              selectedLocation={selectedLocation}
              inventoryData={inventory}
            />
          </div>
        )}

        <StatusButton
          type="submit"
          disabled={outOfStock}
          status={form.formState.isSubmitting ? "loading" : "idle"}
        >
          {outOfStock ? "OUT OF STOCK" : "ADD TO CART"}
        </StatusButton>

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
