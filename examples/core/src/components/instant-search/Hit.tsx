"use client"

import type { Hit as AlgoliaHit, BaseHit } from "instantsearch.js/es/types"

import { useState } from "react"
import { Snippet } from "react-instantsearch"
import { getProductURLSegment, getSkuIdFromOptions } from "src/lib/product-helper"
import { LocaleLink } from "../LocaleLink"
import { formatCurrency } from "src/lib/format-currency"
import { ResponseCurrency, ElasticPathFile } from "@epcc-sdk/sdks-shopper"
import { getMainImageForProductResponse } from "src/lib/file-lookup"
import {
  getDefaultSelection,
  getFamilyVariations,
  getVariationMatrix,
} from "src/lib/product-family"
import type { VariantLookup } from "src/hooks/use-instant-search-variants"
import { HitVariations } from "./HitVariations"

type HitProps = {
  hit: AlgoliaHit<BaseHit>;
  preferredCurrency?: ResponseCurrency;
  mainImages?: ElasticPathFile[];
  variants?: VariantLookup;
}

export function Hit({
  hit,
  preferredCurrency,
  mainImages = [],
  variants = {},
}: HitProps) {
  // A hit is one product family. Child products are filtered out of the result
  // set, so the options come from the parent product itself.
  const variations = getFamilyVariations(hit);
  const [selectedOptionIds, setSelectedOptionIds] = useState(() =>
    getDefaultSelection(variations),
  );

  const matrix = getVariationMatrix(hit);
  const selectedVariantId =
    matrix && selectedOptionIds.length > 0
      ? getSkuIdFromOptions(selectedOptionIds, matrix)
      : undefined;
  const selectedVariant = selectedVariantId
    ? variants[selectedVariantId]
    : undefined;

  const preferredCurrencyCode = preferredCurrency?.code || "USD";
  const productPrice = hit?.attributes?.price?.[preferredCurrencyCode]?.amount;
  const productDisplayPriceWithTax = hit?.meta?.display_price?.with_tax;
  const productDisplayPrice =
    productDisplayPriceWithTax?.currency === preferredCurrencyCode
      ? productDisplayPriceWithTax?.formatted
      : null;
  const parentPrice =
    productDisplayPrice ||
    formatCurrency(
      productPrice || 0,
      preferredCurrency || { code: "USD", decimal_places: 2 },
    )

  // A family's variants can be priced differently, so the card quotes the
  // selected variant rather than the parent it was built from.
  const formattedPrice = selectedVariant?.formattedPrice ?? parentPrice;

  const parentImage = getMainImageForProductResponse(hit as any, mainImages);
  const variantImage = selectedVariant?.mainImageId
    ? mainImages.find((file) => file.id === selectedVariant.mainImageId)
    : undefined;
  const imageUrl = (variantImage ?? parentImage)?.link?.href;

  // Follow the card through to whichever variant it is currently showing.
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
      <HitVariations
        variations={variations}
        selectedOptionIds={selectedOptionIds}
        onSelect={selectOption}
      />
    </div>
  )
}
