import {
  Hits,
  useHits,
} from "react-instantsearch"
import { useInstantSearchImages } from "src/hooks/use-instant-search-images"
import { Hit } from "./Hit"

export function HitsWithImages({ preferredCurrency }: { preferredCurrency?: any }) {
  const { hits } = useHits()
  const mainImages = useInstantSearchImages(hits)

  return (
    <Hits
      hitComponent={(props) => (
        <Hit {...props} preferredCurrency={preferredCurrency} mainImages={mainImages} />
      )}
      classNames={{
        root: "w-full",
        list: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
        item: "flex items-center !p-4 bg-white rounded-md shadow-sm hover:shadow-md transition",
      }}
    />
  )
}
