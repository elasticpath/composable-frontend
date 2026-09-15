import type { FamilyVariation } from "src/lib/product-family"

/**
 * The options a product family offers, on a single search result card.
 *
 * Search results hold one card per family, so the card stands for whichever
 * variant is selected here: choosing an option moves the card's price, image
 * and link onto that child product.
 *
 * These are buttons, so they sit outside the card's link rather than inside it
 * — a control nested in an anchor is neither valid nor operable by keyboard.
 */
export function HitVariations({
  variations,
  selectedOptionIds,
  onSelect,
}: {
  variations: FamilyVariation[]
  // One entry per variation, undefined until the shopper chooses.
  selectedOptionIds: Array<string | undefined>
  onSelect: (variationIndex: number, optionId: string) => void
}) {
  if (variations.length === 0) {
    return null
  }

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      {variations.map((variation, variationIndex) => (
        <div
          key={variation.id}
          role="group"
          aria-label={variation.name}
          className="flex flex-wrap items-center gap-1"
        >
          <span className="text-xs font-medium text-gray-500">
            {variation.name}
          </span>
          {variation.options.map((option) => {
            const isSelected = selectedOptionIds[variationIndex] === option.id

            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(variationIndex, option.id)}
                className={
                  isSelected
                    ? "rounded-full border border-gray-900 bg-gray-900 px-2 py-0.5 text-xs text-white"
                    : "rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-700 hover:border-gray-400"
                }
              >
                {option.name}
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
