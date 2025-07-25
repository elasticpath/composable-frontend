import React from "react"

type PriceDisplayProps = {
  priceData: any
  className?: string
}

export function ProductPrice({ priceData, className = "" }: PriceDisplayProps) {
  if (!priceData) {
    return <p className={`${className} text-gray-500`}>Price not available</p>
  }

  // For meta.display_price.without_tax structure (from Elastic Path API)
  if (priceData.formatted) {
    // Check if there's a sale price
    const hasSale =
      priceData.original_price && priceData.original_price !== priceData.amount

    if (hasSale) {
      return (
        <div className={className}>
          <p className="text-2xl font-bold text-black">
            {priceData.formatted}
            <span className="ml-2 text-sm text-gray-500 line-through">
              {priceData.currency} {priceData.original_price}
            </span>
          </p>
          <p className="text-sm text-red-600">
            Save {priceData.currency}{" "}
            {(priceData.original_price - priceData.amount).toFixed(2)}
          </p>
        </div>
      )
    }

    return (
      <p className={`${className} text-2xl font-bold text-black`}>
        {priceData.formatted}
      </p>
    )
  }

  // For attributes.price structure
  if (priceData.currency) {
    let formattedPrice = "Price not available"
    const currency = priceData.currency

    if (priceData.amount !== undefined && priceData.amount !== null) {
      const priceStr =
        typeof priceData.amount === "object"
          ? JSON.stringify(priceData.amount)
          : String(priceData.amount)

      formattedPrice = `${currency} ${priceStr}`

      // Check if there's a sale price
      if (
        priceData.original_amount &&
        priceData.original_amount !== priceData.amount
      ) {
        const originalPriceStr =
          typeof priceData.original_amount === "object"
            ? JSON.stringify(priceData.original_amount)
            : String(priceData.original_amount)

        return (
          <div className={className}>
            <p className="text-2xl font-bold text-black">
              {formattedPrice}
              <span className="ml-2 text-sm text-gray-500 line-through">
                {currency} {originalPriceStr}
              </span>
            </p>
            <p className="text-sm text-red-600">On Sale</p>
          </div>
        )
      }
    }

    return (
      <p className={`${className} text-2xl font-bold text-black`}>
        {formattedPrice}
      </p>
    )
  }

  // Default fallback if no recognized price structure
  return (
    <p className={`${className} text-2xl font-bold text-black`}>
      Price not available
    </p>
  )
}

// Helper function to extract structured data for price (for JSON-LD)
export function getPriceStructuredData(priceData: any) {
  if (!priceData) return null

  // For meta.display_price structure
  if (priceData.amount && priceData.formatted) {
    const result: Record<string, any> = {
      "@type": "Offer",
      price: String(priceData.amount),
      priceCurrency: priceData.currency || "USD",
    }

    // Add original price if it exists and is different (sales price)
    if (
      priceData.original_price &&
      priceData.original_price !== priceData.amount
    ) {
      result.priceValidUntil = new Date(
        new Date().setMonth(new Date().getMonth() + 1),
      )
        .toISOString()
        .split("T")[0] // Set to 1 month from now by default

      // Add an offer status for sales
      result.offerStatus = "https://schema.org/Offer-InStock"
    }

    return result
  }

  // For attributes.price structure
  if (
    priceData.currency &&
    priceData.amount !== undefined &&
    priceData.amount !== null
  ) {
    const priceStr =
      typeof priceData.amount === "object"
        ? JSON.stringify(priceData.amount)
        : String(priceData.amount)

    const result: Record<string, any> = {
      "@type": "Offer",
      price: priceStr,
      priceCurrency: priceData.currency || "USD",
    }

    // Add original price if it exists and is different (sales price)
    if (
      priceData.original_amount &&
      priceData.original_amount !== priceData.amount
    ) {
      result.priceValidUntil = new Date(
        new Date().setMonth(new Date().getMonth() + 1),
      )
        .toISOString()
        .split("T")[0] // Set to 1 month from now by default

      // Add an offer status for sales
      result.offerStatus = "https://schema.org/Offer-InStock"
    }

    return result
  }

  return null
}
