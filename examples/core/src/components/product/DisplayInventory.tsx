"use client"

import { type StockResponse, type Location } from "@epcc-sdk/sdks-shopper"

interface DisplayInventoryProps {
  inventoryData?: StockResponse
  selectedLocation?: Location
}

export default function DisplayInventory({
  selectedLocation,
  inventoryData,
}: DisplayInventoryProps) {
  const locationInventory =
    inventoryData?.attributes &&
    (inventoryData.attributes.locations
      ? inventoryData.attributes.locations?.[selectedLocation?.attributes.slug ?? ""]
      : inventoryData.attributes)

  if (!inventoryData) {
    return (
      <div className="text-sm text-gray-500">
        Inventory not tracked for this product
      </div>
    )
  }

  if (!selectedLocation && inventoryData?.attributes?.locations) {
    return (
      <div className="text-sm text-gray-500">
        Select a location to view stock
      </div>
    )
  }

  if (!locationInventory) {
    return (
      <div className="text-sm text-gray-500">
        No stock information available for this location
      </div>
    )
  }

  const levels = {
    available: Number(locationInventory.available),
    allocated: Number(locationInventory.allocated),
    total: Number(locationInventory.total),
  }

  if (locationInventory.available === BigInt(0)) {
    return (
      <div className="text-sm text-gray-500">
        No stock information available
      </div>
    )
  }

  const locationName = selectedLocation?.attributes?.name || "Selected location"
  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
      <h4 className="font-medium text-gray-900">{selectedLocation ? `Stock at ${locationName}` : 'Stock'}</h4>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-gray-600 block">Available</span>
          <span
            className={`font-semibold ${
              levels.available > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {levels.available}
          </span>
        </div>
        <div>
          <span className="text-gray-600 block">Allocated</span>
          <span className="font-semibold text-gray-900">
            {levels.allocated}
          </span>
        </div>
        <div>
          <span className="text-gray-600 block">Total</span>
          <span className="font-semibold text-gray-900">{levels.total}</span>
        </div>
      </div>
      {levels.available === 0 && (
        <p className="text-sm text-red-600 mt-2">
          {selectedLocation ? 'Out of stock at this location' : 'Out of stock'}
        </p>
      )}
    </div>
  )
}