import type { Hit as AlgoliaHit, BaseHit } from "instantsearch.js/es/types"

import { Snippet } from "react-instantsearch"
import { getProductURLSegment } from "src/lib/product-helper"
import { LocaleLink } from "../LocaleLink"
import { formatCurrency } from "src/lib/format-currency"
import { ResponseCurrency, ElasticPathFile } from "@epcc-sdk/sdks-shopper"
import { getMainImageForProductResponse } from "src/lib/file-lookup"

type HitProps = {
  hit: AlgoliaHit<BaseHit>;
  preferredCurrency?: ResponseCurrency;
  mainImages?: ElasticPathFile[];
}

export function Hit({ hit, preferredCurrency, mainImages = [] }: HitProps) {
  const productSlug = hit?.attributes?.slug;
  const canonicalURL = getProductURLSegment({ id: hit.id, attributes: { slug: productSlug } });

  const preferredCurrencyCode = preferredCurrency?.code || "USD";
  const productPrice = hit?.attributes?.price?.[preferredCurrencyCode]?.amount;
  const productDisplayPriceWithTax = hit?.meta?.display_price?.with_tax;
  const productDisplayPrice =
    productDisplayPriceWithTax?.currency === preferredCurrencyCode
      ? productDisplayPriceWithTax?.formatted
      : null;
  const formattedPrice =
    productDisplayPrice ||
    formatCurrency(
      productPrice || 0,
      preferredCurrency || { code: "USD", decimal_places: 2 },
    )

  const mainImage = getMainImageForProductResponse(hit as any, mainImages);
  const imageUrl = mainImage?.link?.href;

  return (
    <LocaleLink key={(hit as any).id} href={canonicalURL} className="grid items-center gap-4">
      <div className="flex items-center justify-center h-[100px]">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={hit.attributes.name} 
            className="max-h-full object-contain" 
          />
        ) : (
          <img src="https://placehold.co/400" alt={hit.attributes.name} className="max-h-full" />
        )}
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
