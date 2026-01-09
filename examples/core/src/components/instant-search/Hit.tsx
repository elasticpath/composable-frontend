import type { Hit as AlgoliaHit, BaseHit } from "instantsearch.js/es/types"

import { Snippet } from "react-instantsearch"
import { getProductURLSegment } from "src/lib/product-helper"
import { LocaleLink } from "../LocaleLink"
import { formatCurrency } from "src/lib/format-currency"
import { ResponseCurrency } from "@epcc-sdk/sdks-shopper"

type HitProps = {
  hit: AlgoliaHit<BaseHit>;
  preferredCurrency?: ResponseCurrency;
}

export function Hit({ hit, preferredCurrency }: HitProps) {
  const productSlug = (hit as any)?.attributes?.slug;
  const canonicalURL = getProductURLSegment({ id: (hit as any).id, attributes: { slug: productSlug } });

  const preferredCurrencyCode = preferredCurrency?.code || "USD";
  const productPrice = (hit as any)?.attributes?.price?.[preferredCurrencyCode]?.amount;
  const formattedPrice =
    // hit?.meta?.display_price?.with_tax?.formatted ||
    formatCurrency(
      productPrice || 0,
      preferredCurrency || { code: "USD", decimal_places: 2 },
    )

  return (
    <LocaleLink key={(hit as any).id} href={canonicalURL} className="grid items-center gap-4">
      <div className="flex items-center justify-center h-[100px]">
        <img src="https://placehold.co/400" alt={hit.attributes.name} className="max-h-full" />
      </div>
      <div>
        <h1 className="block text-base font-bold my-[0.67em] mx-0">
          <Snippet hit={hit} attribute={"attributes.name" as never} />
        </h1>
        <div className="text-sm font-normal">
          <span>{formattedPrice}</span>
        </div>
      </div>
    </LocaleLink>
  )
}
