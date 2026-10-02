import clsx from "clsx"
import Image from "next/image"
import type { FamilyVariation, FamilyVariationOption } from "src/lib/product-family"
import { TEXT_SWATCH, type OptionSwatch } from "src/lib/variation-swatches"

type Appearance = "page" | "card"

const appearances = {
  page: {
    groups: "flex flex-col gap-4",
    fieldset: "m-0 grid gap-2 border-0 p-0",
    options: "flex flex-wrap items-center gap-2",
    swatchOptions: "flex flex-wrap items-center gap-3",
    textOption: "rounded-md border px-6 py-3 font-semibold",
    textSelected: "bg-brand-primary text-white",
    textUnselected: "bg-white text-gray-800 hover:border-gray-400",
    colorSize: "h-8 w-8",
    imageSize: "h-12 w-12",
    imagePixels: 48,
  },
  card: {
    groups: "mt-2 flex flex-col gap-1.5",
    fieldset: "m-0 flex flex-wrap items-center gap-1.5 border-0 p-0",
    options: "contents",
    swatchOptions: "contents",
    textOption: "rounded-full border px-2 py-0.5 text-xs",
    textSelected: "border-gray-900 bg-gray-900 font-semibold text-white",
    textUnselected: "border-gray-200 text-gray-700 hover:border-gray-400",
    colorSize: "h-5 w-5",
    imageSize: "h-8 w-8",
    imagePixels: 32,
  },
} satisfies Record<Appearance, Record<string, string | number>>

const focusRingOnRadio =
  "peer-focus-visible:outline peer-focus-visible:outline-2 " +
  "peer-focus-visible:outline-offset-[6px] peer-focus-visible:outline-blue-600"

export function variationGroupName(groupIdPrefix: string, variationId: string) {
  return `${groupIdPrefix}-${variationId}`
}

export function VariationOptions({
  groupIdPrefix,
  productName,
  variations,
  swatches,
  selectedOptionIds,
  onSelect,
  appearance,
  focusSelectedOptionOfGroup,
}: {
  groupIdPrefix: string
  productName?: string
  variations: FamilyVariation[]
  swatches: OptionSwatch[][]
  selectedOptionIds: Array<string | undefined>
  onSelect: (variationIndex: number, optionId: string) => void
  appearance: Appearance
  focusSelectedOptionOfGroup?: string
}) {
  if (variations.length === 0) {
    return null
  }

  const styles = appearances[appearance]

  return (
    <div className={styles.groups}>
      {variations.map((variation, variationIndex) => {
        const groupName = variationGroupName(groupIdPrefix, variation.id)
        const selectedOption = variation.options.find(
          (option) => option.id === selectedOptionIds[variationIndex],
        )
        const groupSwatches = swatches[variationIndex] ?? []
        const groupShowsSwatches = groupSwatches.some(
          (swatch) => swatch.kind !== "text",
        )

        return (
          <fieldset key={variation.id} className={styles.fieldset}>
            {appearance === "card" ? (
              <>
                <legend className="sr-only">
                  {productName ? `${productName} ${variation.name}` : variation.name}
                </legend>
                <span aria-hidden="true" className="text-xs font-medium text-gray-500">
                  {variation.name}
                </span>
              </>
            ) : (
              <legend className="mb-2 p-0">
                {variation.name}
                {groupShowsSwatches && selectedOption && (
                  <span aria-hidden="true" className="text-gray-600">
                    : {selectedOption.name}
                  </span>
                )}
              </legend>
            )}
            <div className={groupShowsSwatches ? styles.swatchOptions : styles.options}>
              {variation.options.map((option, optionIndex) => (
                <OptionRadio
                  key={option.id}
                  inputId={`${groupName}-${option.id}`}
                  groupName={groupName}
                  option={option}
                  swatch={groupSwatches[optionIndex] ?? TEXT_SWATCH}
                  isSelected={selectedOption?.id === option.id}
                  takesFocusOnMount={
                    groupName === focusSelectedOptionOfGroup &&
                    selectedOption?.id === option.id
                  }
                  onSelect={() => onSelect(variationIndex, option.id)}
                  styles={styles}
                />
              ))}
            </div>
          </fieldset>
        )
      })}
    </div>
  )
}

function OptionRadio({
  inputId,
  groupName,
  option,
  swatch,
  isSelected,
  takesFocusOnMount,
  onSelect,
  styles,
}: {
  inputId: string
  groupName: string
  option: FamilyVariationOption
  swatch: OptionSwatch
  isSelected: boolean
  takesFocusOnMount: boolean
  onSelect: () => void
  styles: (typeof appearances)[Appearance]
}) {
  return (
    <span className="contents">
      <input
        type="radio"
        id={inputId}
        name={groupName}
        value={option.id}
        checked={isSelected}
        autoFocus={takesFocusOnMount}
        onChange={onSelect}
        className="sr-only peer"
      />
      {swatch.kind === "text" ? (
        <label
          htmlFor={inputId}
          className={clsx(
            "cursor-pointer",
            styles.textOption,
            isSelected ? styles.textSelected : styles.textUnselected,
            focusRingOnRadio,
          )}
        >
          {option.name}
        </label>
      ) : (
        <label
          htmlFor={inputId}
          title={option.name}
          className={clsx(
            "inline-flex cursor-pointer ring-offset-2 ring-offset-white",
            swatch.kind === "color" ? "rounded-full" : "rounded-md",
            isSelected
              ? "ring-2 ring-gray-900"
              : "hover:ring-1 hover:ring-gray-400",
            focusRingOnRadio,
          )}
        >
          {swatch.kind === "color" ? (
            <span
              aria-hidden="true"
              className={clsx(
                "block rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.2)]",
                styles.colorSize,
              )}
              style={{ backgroundColor: swatch.color }}
            />
          ) : (
            <Image
              src={swatch.url}
              alt=""
              width={styles.imagePixels}
              height={styles.imagePixels}
              className={clsx(
                "block rounded-md border border-gray-200 bg-white object-cover",
                styles.imageSize,
              )}
            />
          )}
          <span className="sr-only">{option.name}</span>
        </label>
      )}
    </span>
  )
}
