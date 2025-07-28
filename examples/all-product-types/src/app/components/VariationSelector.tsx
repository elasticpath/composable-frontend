"use client"

import { Variation } from "@epcc-sdk/sdks-shopper"
import { OptionDict } from "../context/types"

interface VariationSelectorProps {
  variations: Variation[]
  selectedOptions: OptionDict
  onOptionChange: (variationId: string, optionId: string) => void
}

export default function VariationSelector({
  variations,
  selectedOptions,
  onOptionChange,
}: VariationSelectorProps) {
  const handleOptionClick = (variationId: string, optionId: string) => {
    onOptionChange(variationId, optionId)
  }

  return (
    <div className="space-y-4">
      {variations.map((variation) => {
        if (
          !variation.id ||
          !variation.options ||
          variation.options.length === 0
        ) {
          return null
        }

        return (
          <div key={variation.id}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {variation.name || "Select Option"}
            </label>
            <div className="flex flex-wrap gap-2">
              {variation.options.map((option) => {
                if (!option.id) return null

                const isSelected = variation.id
                  ? selectedOptions[variation.id] === option.id
                  : false

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionClick(variation.id!, option.id!)}
                    className={`px-4 py-2 border rounded-md transition-colors ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {option.name || option.id}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
