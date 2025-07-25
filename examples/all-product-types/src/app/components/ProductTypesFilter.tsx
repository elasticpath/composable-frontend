"use client"

import { useState } from "react"
import { COMMON_PRODUCT_TYPES } from "../../lib/filters"

interface ProductTypesFilterProps {
  selectedTypes: string[]
  onChange: (types: string[]) => void
  className?: string
}

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  child: "Child Products",
  parent: "Parent Products", 
  bundle: "Product Bundles",
  standalone: "Standalone Products"
}

export default function ProductTypesFilter({
  selectedTypes,
  onChange,
  className = "",
}: ProductTypesFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTypeToggle = (type: string) => {
    if (selectedTypes.includes(type)) {
      onChange(selectedTypes.filter((t) => t !== type))
    } else {
      onChange([...selectedTypes, type])
    }
  }

  const handleClearAll = () => {
    onChange([])
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <span className="text-sm font-medium">Product Types</span>
          {selectedTypes.length > 0 && (
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
              {selectedTypes.length}
            </span>
          )}
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {selectedTypes.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear all
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-64 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-2">
            {COMMON_PRODUCT_TYPES.map((type) => (
              <label
                key={type}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(type)}
                  onChange={() => handleTypeToggle(type)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm">{PRODUCT_TYPE_LABELS[type] || type}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Selected types display */}
      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTypes.map((type) => (
            <span
              key={type}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {PRODUCT_TYPE_LABELS[type] || type}
              <button
                onClick={() => handleTypeToggle(type)}
                className="hover:text-blue-600"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}