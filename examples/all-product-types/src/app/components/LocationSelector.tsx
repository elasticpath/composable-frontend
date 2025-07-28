"use client"

import type { Location } from "@epcc-sdk/sdks-shopper"

interface LocationSelectorProps {
  locations: Location[]
  selectedLocation?: Location
  onLocationChange: (location: Location) => void
  className?: string
}

export function LocationSelector({
  locations,
  selectedLocation,
  onLocationChange,
  className = "",
}: LocationSelectorProps) {
  if (locations.length === 0) {
    return (
      <div className={`text-sm text-gray-500 ${className}`}>
        No locations available
      </div>
    )
  }

  if (locations.length === 1) {
    return (
      <div className={`text-sm text-gray-700 ${className}`}>
        <span className="font-medium">Location:</span>{" "}
        {locations[0].attributes.name}
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <label
        htmlFor="location-select"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        Select Location
      </label>
      <select
        id="location-select"
        value={selectedLocation?.id || ""}
        onChange={(e) => {
          const location = locations.find((loc) => loc.id === e.target.value)
          if (location) {
            onLocationChange(location)
          }
        }}
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        <option value="">Select a location</option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.attributes.name}
            {location.attributes.description &&
              ` - ${location.attributes.description}`}
          </option>
        ))}
      </select>
    </div>
  )
}
