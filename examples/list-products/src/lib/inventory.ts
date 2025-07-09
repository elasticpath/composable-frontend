import {
  getStock,
  listLocations,
  type Location,
  type StockResponse,
} from "@epcc-sdk/sdks-shopper"

/**
 * Fetches all inventory locations
 * Returns empty array if no locations found or on error
 */
export async function fetchInventoryLocations(): Promise<Location[]> {
  try {
    const response = await listLocations({})

    if (!response.data?.data) {
      return []
    }

    return response.data.data
  } catch (error) {
    console.error("Failed to fetch inventory locations:", error)
    return []
  }
}

/**
 * Fetches stock information for a specific product
 * Returns null if no stock data found or on error
 */
export async function fetchProductStock(
  productId: string,
): Promise<StockResponse | null> {
  try {
    const response = await getStock({
      path: { product_uuid: productId },
    })

    if (!response.data?.data) {
      return null
    }

    return response.data.data
  } catch (error) {
    console.error(`Failed to fetch stock for product ${productId}:`, error)
    return null
  }
}

/**
 * Gets stock level for a specific location
 * Returns null if location not found or no stock data
 */
export function getStockForLocation(
  stock: StockResponse,
  locationSlug: string,
): { available: BigInt; allocated: BigInt; total: BigInt } | null {
  if (
    !stock.attributes.locations ||
    !stock.attributes.locations[locationSlug]
  ) {
    return null
  }

  return stock.attributes.locations[locationSlug]
}

/**
 * Gets availability status based on stock level
 * Following B2B best practices for stock display
 */
export function getAvailabilityStatus(stockLevel: {
  available: BigInt
  allocated: BigInt
  total: BigInt
}): {
  status: "in-stock" | "limited" | "out-of-stock"
  label: string
  color: string
} {
  const available = Number(stockLevel.available)

  if (available <= 0) {
    return {
      status: "out-of-stock",
      label: "Out of Stock",
      color: "text-red-600",
    }
  }

  if (available <= 5) {
    return {
      status: "limited",
      label: `Limited Stock (${available} available)`,
      color: "text-amber-600",
    }
  }

  return {
    status: "in-stock",
    label: `In Stock (${available} available)`,
    color: "text-green-600",
  }
}

/**
 * Helper function to find the default location to display
 * Returns the first location with available stock, or the first location if none have stock
 */
export function getDefaultLocation(
  stock: StockResponse,
  locations: Location[],
): Location | null {
  if (!stock.attributes.locations || locations.length === 0) {
    return null
  }

  // First try to find a location with available stock
  const locationWithStock = locations.find((location) => {
    const stockLevel = stock.attributes.locations?.[location.attributes.slug]
    return stockLevel && Number(stockLevel.available) > 0
  })

  if (locationWithStock) {
    return locationWithStock
  }

  // If no location has stock, return the first location
  return locations[0]
}

/**
 * Helper function to get structured data availability for SEO
 * Maps to schema.org availability values
 */
export function getStructuredDataAvailability(stockLevel: {
  available: BigInt
  allocated: BigInt
  total: BigInt
}): string {
  const available = Number(stockLevel.available)

  if (available <= 0) {
    return "https://schema.org/OutOfStock"
  }

  if (available <= 5) {
    return "https://schema.org/LimitedAvailability"
  }

  return "https://schema.org/InStock"
}
