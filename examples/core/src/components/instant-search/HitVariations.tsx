import type { FamilyVariation } from "src/lib/product-family"

/**
 * Summarises the options a product family offers, for a single search result
 * card. Search results hold one card per family, so the card has to say what
 * the family covers rather than which child product matched.
 */
export function HitVariations({
  variations,
}: {
  variations: FamilyVariation[]
}) {
  if (variations.length === 0) {
    return null
  }

  return (
    <dl className="mt-2 flex flex-col gap-1.5">
      {variations.map((variation) => (
        <div key={variation.id} className="flex flex-wrap items-center gap-1">
          <dt className="text-xs font-medium text-gray-500">
            {variation.name}
          </dt>
          <dd className="flex flex-wrap items-center gap-1">
            {variation.options.map((option) => (
              <span
                key={option.id}
                className="rounded-full border border-gray-200 px-2 py-0.5 text-xs text-gray-700"
              >
                {option.name}
              </span>
            ))}
          </dd>
        </div>
      ))}
    </dl>
  )
}
