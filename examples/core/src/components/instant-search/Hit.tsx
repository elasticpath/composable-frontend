"use client"

import type { Hit as AlgoliaHit, BaseHit } from "instantsearch.js/es/types"

import { useMemo, useState } from "react"
import { Snippet } from "react-instantsearch"
import { getProductURLSegment, getSkuIdFromOptions } from "src/lib/product-helper"
import { LocaleLink } from "../LocaleLink"
import { resolveCardPrice } from "src/lib/resolve-card-price"
import { resolveFamilyPrice } from "src/lib/resolve-family-price"
import { ResponseCurrency, ElasticPathFile } from "@epcc-sdk/sdks-shopper"
import { getMainImageForProductResponse } from "src/lib/file-lookup"
import {
  collectVariantProductIds,
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
  const variations = getFamilyVariations(hit);
  const isFamily = variations.length > 0;

  const [selectedOptionIds, setSelectedOptionIds] = useState<
    Array<string | undefined>
  >(() => variations.map(() => undefined));

  const matrix = getVariationMatrix(hit);
  const fullSelection = selectedOptionIds.every(isString)
    ? selectedOptionIds
    : undefined;
  const selectedVariantId =
    matrix && fullSelection && fullSelection.length > 0
      ? getSkuIdFromOptions(fullSelection, matrix)
      : undefined;
  const selectedVariant = selectedVariantId
    ? variants[selectedVariantId]
    : undefined;

  const familyVariants = useMemo(
    () => collectVariantProductIds([hit]).map((id) => variants[id] ?? { id }),
    [hit, variants],
  );

  // A family quotes its variants, never the parent: a parent can carry a price
  // no variant has.
  const formattedPrice = isFamily
    ? (selectedVariant?.formattedPrice ?? resolveFamilyPrice(familyVariants))
    : resolveCardPrice({ hit, preferredCurrency });

  // A parent's image is often not a picture of the thing being sold.
  const representativeId =
    matrix && isFamily
      ? getSkuIdFromOptions(getDefaultSelection(variations), matrix)
      : undefined;
  const shownVariant =
    selectedVariant ?? (representativeId ? variants[representativeId] : undefined);

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

  function isString(value: string | undefined): value is string {
    return typeof value === "string";
  }

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
          {formattedPrice && (
            <div className="text-sm font-normal">
              <span>{formattedPrice}</span>
            </div>
          )}
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
