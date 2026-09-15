import { useMemo } from "react"
import {
  Hits,
  useHits,
} from "react-instantsearch"
import { useInstantSearchImages } from "src/hooks/use-instant-search-images"
import { useInstantSearchVariants } from "src/hooks/use-instant-search-variants"
import { Hit } from "./Hit"

export function HitsWithImages({ preferredCurrency }: { preferredCurrency?: any }) {
  const { hits } = useHits()

  // One batched query resolves every variant behind the families on this page,
  // and their images ride along in the existing file lookup.
  const variants = useInstantSearchVariants(hits)
  const variantImageIds = useMemo(
    () =>
      Object.values(variants)
        .map((variant) => variant.mainImageId)
        .filter((id): id is string => Boolean(id)),
    [variants],
  )
  const mainImages = useInstantSearchImages(hits, variantImageIds)

  return (
    <Hits
      hitComponent={(props) => (
        <Hit
          {...props}
          preferredCurrency={preferredCurrency}
          mainImages={mainImages}
          variants={variants}
        />
      )}
      classNames={{
        root: "w-full",
        list: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        item: "flex items-center !p-4 bg-white rounded-md shadow-sm hover:shadow-md transition",
      }}
    />
  )
}
