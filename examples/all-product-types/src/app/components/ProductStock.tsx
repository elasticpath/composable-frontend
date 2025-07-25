import React from "react"

type StockDisplayProps = {
  stockData?: any
  className?: string
}

export function ProductStock({ stockData, className = "" }: StockDisplayProps) {
  // Default status if no stock data is available
  let stockStatus = "In Stock"
  let statusColor = "text-green-600"

  // If we have stock data, determine the actual status
  if (stockData) {
    if (stockData.availability === "out-of-stock") {
      stockStatus = "Out of Stock"
      statusColor = "text-red-600"
    } else if (stockData.availability === "limited") {
      stockStatus = "Limited Stock"
      statusColor = "text-amber-600"
    } else if (stockData.availability === "pre-order") {
      stockStatus = "Pre-Order"
      statusColor = "text-blue-600"
    } else if (stockData.availability === "backorder") {
      stockStatus = "Backordered"
      statusColor = "text-purple-600"
    }

    // If we have a specific level, show it
    if (stockData.level !== undefined) {
      stockStatus = `${stockStatus} (${stockData.level} available)`
    }
  }

  return (
    <p className={`${className} ${statusColor}`}>Availability: {stockStatus}</p>
  )
}

// Helper function to get structured data for availability
export function getStockStructuredData(stockData: any) {
  if (!stockData) {
    return "https://schema.org/InStock"
  }

  // Map availability values to schema.org values
  switch (stockData.availability) {
    case "out-of-stock":
      return "https://schema.org/OutOfStock"
    case "limited":
      return "https://schema.org/LimitedAvailability"
    case "pre-order":
      return "https://schema.org/PreOrder"
    case "backorder":
      return "https://schema.org/BackOrder"
    default:
      return "https://schema.org/InStock"
  }
}
