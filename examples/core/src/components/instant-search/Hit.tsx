"use client"

import type { Hit as AlgoliaHit, BaseHit } from "instantsearch.js/es/types"

import { useState } from "react"
import { Snippet } from "react-instantsearch"
import { getProductURLSegment } from "src/lib/product-helper"
import { LocaleLink } from "../LocaleLink"
import { resolveCardPrice } from "src/lib/resolve-card-price"
import { resolveCardState } from "src/lib/resolve-card-state"
import { ResponseCurrency, ElasticPathFile } from "@epcc-sdk/sdks-shopper"
import { getMainImageForProductResponse } from "src/lib/file-lookup"
import { getFamilyVariations, getVariationMatrix } from "src/lib/product-family"
import type { VariantLookup } from "src/hooks/use-instant-search-variants"
import { HitVariations } from "./HitVariations"

type HitProps = {
  hit: AlgoliaHit<BaseHit>;
  preferredCurrency?: ResponseCurrency;
  mainImages?: ElasticPathFile[];
  variants?: VariantLookup;
  variantsPending?: boolean;
}

export function Hit({
  hit,
  preferredCurrency,
  mainImages = [],
  variants = {},
  variantsPending = false,
}: HitProps) {
  const variations = getFamilyVariations(hit);
  const matrix = getVariationMatrix(hit);
  const productName = hit?.attributes?.name as string | undefined;

  const [selectedOptionIds, setSelectedOptionIds] = useState<
    Array<string | undefined>
  >(() => variations.map(() => undefined));

  const { selectedVariant, representativeVariant, price } = resolveCardState({
    variations,
    matrix,
    variants,
    selectedOptionIds,
    currency: preferredCurrency?.code,
  });

  const isFamily = variations.length > 0;
  const formattedPrice = isFamily
    ? price && (price.isFrom ? `from ${price.formatted}` : price.formatted)
    : resolveCardPrice({ hit, preferredCurrency });

  // A parent's image is often not a picture of the thing being sold.
  const shownVariant = selectedVariant ?? representativeVariant;
  const parentImage = getMainImageForProductResponse(hit as any, mainImages);
  const variantImage = shownVariant?.mainImageId
    ? mainImages.find((file) => file.id === shownVariant.mainImageId)
    : undefined;
  const imageUrl = (variantImage ?? parentImage)?.link?.href;

  const canonicalURL = selectedVariant
    ? getProductURLSegment({
        id: selectedVariant.id,
        attributes: { slug: selectedVariant.slug },
      })
    : getProductURLSegment({
        id: hit.id,
        attributes: { slug: hit?.attributes?.slug },
      });

  function selectOption(variationIndex: number, optionId: string) {
    setSelectedOptionIds((current) =>
      current.map((selected, index) =>
        index === variationIndex ? optionId : selected,
      ),
    );
  }

  return (
    <div className="grid w-full gap-1">
      <LocaleLink href={canonicalURL} className="grid items-center gap-4">
        <div className="flex items-center justify-center h-[100px]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={productName}
              className="max-h-full object-contain"
            />
          ) : (
            <img src="https://placehold.co/400" alt={productName} className="max-h-full" />
          )}
        </div>
        <div>
          <h1 className="block text-base font-bold my-[0.67em] mx-0">
            <Snippet hit={hit} attribute={"attributes.name" as never} />
          </h1>
          {/* Announced because choosing an option changes it. */}
          <div className="text-sm font-normal" aria-live="polite">
            {formattedPrice ? (
              <span>{formattedPrice}</span>
            ) : (
              isFamily &&
              variantsPending && <span className="text-gray-400">Pricing…</span>
            )}
          </div>
        </div>
      </LocaleLink>
      <HitVariations
        productId={hit.objectID ?? (hit.id as string)}
        productName={productName}
        variations={variations}
        selectedOptionIds={selectedOptionIds}
        onSelect={selectOption}
      />
    </div>
  )
}
