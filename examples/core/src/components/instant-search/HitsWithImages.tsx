import { useCallback, useMemo } from "react"
import {
  Hits,
  useHits,
} from "react-instantsearch"
import { useInstantSearchImages } from "src/hooks/use-instant-search-images"
import { useInstantSearchVariants } from "src/hooks/use-instant-search-variants"
import { Hit } from "./Hit"

export function HitsWithImages({ preferredCurrency }: { preferredCurrency?: any }) {
  const { hits } = useHits()

  const { variants, isPending } = useInstantSearchVariants(hits)
  const variantImageIds = useMemo(
    () =>
      Object.values(variants)
        .map((variant) => variant.mainImageId)
        .filter((id): id is string => Boolean(id)),
    [variants],
  )
  const mainImages = useInstantSearchImages(hits, variantImageIds)

  // Kept stable: a fresh function here is a fresh component type, which
  // remounts every card and loses whatever the shopper had chosen on it.
  const hitComponent = useCallback(
    (props: any) => (
      <Hit
        {...props}
        preferredCurrency={preferredCurrency}
        mainImages={mainImages}
        variants={variants}
        variantsPending={isPending}
      />
    ),
    [preferredCurrency, mainImages, variants, isPending],
  )

  return (
    <Hits
      hitComponent={hitComponent}
      classNames={{
        root: "w-full",
        list: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        item: "flex items-center !p-4 bg-white rounded-md shadow-sm hover:shadow-md transition",
      }}
    />
  )
}
