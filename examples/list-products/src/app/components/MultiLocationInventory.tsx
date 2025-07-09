"use client"

import { useState, useEffect } from "react"
import { type Location, type StockResponse } from "@epcc-sdk/sdks-shopper"
import { LocationSelector } from "./LocationSelector"
import { 
  getStockForLocation, 
  getAvailabilityStatus, 
  getDefaultLocation 
} from "../../lib/inventory"

interface MultiLocationInventoryProps {
  stock: StockResponse | null
  locations: Location[]
  className?: string
}

export function MultiLocationInventory({
  stock,
  locations,
  className = "",
}: MultiLocationInventoryProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  // Set default location when stock or locations change
  useEffect(() => {
    if (stock && locations.length > 0) {
      const defaultLocation = getDefaultLocation(stock, locations)
      setSelectedLocation(defaultLocation)
    }
  }, [stock, locations])

  // Handle case where no stock data is available
  if (!stock) {
    return (
      <div className={`${className}`}>
        <div className="text-sm text-gray-500">
          Inventory information not available
        </div>
      </div>
    )
  }

  // Handle case where no locations are available
  if (locations.length === 0) {
    return (
      <div className={`${className}`}>
        <div className="text-sm text-gray-500">
          No inventory locations configured
        </div>
      </div>
    )
  }

  // Get stock for the selected location
  const locationStock = selectedLocation 
    ? getStockForLocation(stock, selectedLocation.attributes.slug)
    : null

  // If no location is selected or no stock for location, show aggregate stock
  const displayStock = locationStock || {
    available: stock.attributes.available,
    allocated: stock.attributes.allocated,
    total: stock.attributes.total,
  }

  const availability = getAvailabilityStatus(displayStock)

  return (
    <div className={`${className}`}>
      <LocationSelector
        locations={locations}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        className="mb-3"
      />
      
      <div className="space-y-2">
        {/* Availability Status */}
        <div className={`text-sm font-medium ${availability.color}`}>
          {availability.label}
        </div>
        
        {/* Location-specific note */}
        {selectedLocation && locationStock && (
          <div className="text-xs text-gray-500 mt-2">
            Stock levels for {selectedLocation.attributes.name}
          </div>
        )}
        
        {/* Fallback to aggregate when no location-specific stock */}
        {selectedLocation && !locationStock && (
          <div className="text-xs text-gray-500 mt-2">
            Showing aggregate stock (location-specific data not available)
          </div>
        )}
      </div>
    </div>
  )
}