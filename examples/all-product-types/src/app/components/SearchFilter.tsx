"use client"

import React, { useState } from "react"

interface SearchFilterProps {
  nameValue: string
  skuValue: string
  onFiltersChange: (name: string, sku: string) => void
  className?: string
}

export default function SearchFilter({
  nameValue,
  skuValue,
  onFiltersChange,
  className = "",
}: SearchFilterProps) {
  const [nameInput, setNameInput] = useState(nameValue)
  const [skuInput, setSkuInput] = useState(skuValue)
  
  // Update local state when props change (for URL navigation)
  React.useEffect(() => {
    setNameInput(nameValue)
  }, [nameValue])
  
  React.useEffect(() => {
    setSkuInput(skuValue)
  }, [skuValue])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange(nameInput, skuInput)
  }

  const handleClear = () => {
    setNameInput("")
    setSkuInput("")
    onFiltersChange("", "")
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Product Name Filter */}
        <div className="relative">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Exact product name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {nameInput && (
            <button
              type="button"
              onClick={() => {
                setNameInput("")
                onFiltersChange("", skuInput)
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* SKU Filter */}
        <div className="relative">
          <input
            type="text"
            value={skuInput}
            onChange={(e) => setSkuInput(e.target.value)}
            placeholder="Exact SKU..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {skuInput && (
            <button
              type="button"
              onClick={() => {
                setSkuInput("")
                onFiltersChange(nameInput, "")
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Apply Filters
        </button>
        {(nameInput || skuInput) && (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>
    </form>
  )
}