import type { FamilyVariation } from "src/lib/product-family"

/**
 * Rendered outside the card's link: a control nested in an anchor is not
 * operable. Native radios so that grouping, arrow-key navigation and the
 * one-of-many semantics come from the browser rather than from ARIA alone.
 */
export function HitVariations({
  productId,
  productName,
  variations,
  selectedOptionIds,
  onSelect,
}: {
  productId: string
  productName?: string
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
      {variations.map((variation, variationIndex) => {
        const groupName = `${productId}-${variation.id}`

        return (
          <fieldset
            key={variation.id}
            className="m-0 flex flex-wrap items-center gap-1 border-0 p-0"
          >
            {/* Named per product: a page of cards otherwise has many groups called "Size". */}
            <legend className="sr-only">
              {productName ? `${productName} ${variation.name}` : variation.name}
            </legend>
            <span aria-hidden="true" className="text-xs font-medium text-gray-500">
              {variation.name}
            </span>
            {variation.options.map((option) => {
              const isSelected = selectedOptionIds[variationIndex] === option.id
              const inputId = `${groupName}-${option.id}`

              return (
                <span key={option.id} className="contents">
                  <input
                    type="radio"
                    id={inputId}
                    name={groupName}
                    value={option.id}
                    checked={isSelected}
                    onChange={() => onSelect(variationIndex, option.id)}
                    className="sr-only peer"
                  />
                  <label
                    htmlFor={inputId}
                    className={
                      // Weight as well as colour, so the choice is not carried
                      // by colour alone.
                      (isSelected
                        ? "border-gray-900 bg-gray-900 font-semibold text-white "
                        : "border-gray-200 text-gray-700 hover:border-gray-400 ") +
                      "cursor-pointer rounded-full border px-2 py-0.5 text-xs " +
                      // An explicit colour: the outline would otherwise inherit
                      // the label's own, which is white once selected and so
                      // invisible against the card.
                      "peer-focus-visible:outline peer-focus-visible:outline-2 " +
                      "peer-focus-visible:outline-offset-2 peer-focus-visible:outline-blue-600"
                    }
                  >
                    {option.name}
                  </label>
                </span>
              )
            })}
          </fieldset>
        )
      })}
    </div>
  )
}
