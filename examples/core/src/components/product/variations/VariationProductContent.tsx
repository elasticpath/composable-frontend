"use client";
import { useShopperProductContext } from "../useShopperProductContext";
import ProductCarousel from "../carousel/ProductCarousel";
import ProductSummary from "../ProductSummary";
import ProductDetails from "../ProductDetails";
import ProductExtensions from "../ProductExtensions";
import { LocationSelector } from "../LocationSelector";
import React from "react";
import { StatusButton } from "../../button/StatusButton";
import { useFormContext } from "react-hook-form";
import ProductVariations from "./ProductVariations";
import { QuantitySelector } from "../QuantitySelector";
import DisplayInventory from "../DisplayInventory";
import { useVariationProduct } from "./useVariationContext";
import { resolveFamilyPrice } from "../../../lib/resolve-family-price";

export function VariationProductContent() {
  const form = useFormContext();
  const { product, inventory, media, locations } = useShopperProductContext();
  const { variationProducts } = useVariationProduct();
  const extensions = product.data?.attributes?.extensions;

  const watchedLocation = form.watch("location");

  if (!product.data) {
    return null;
  }

  const outOfStock =
    inventory &&
    ((!inventory?.attributes.locations &&
      Number(inventory.attributes.available) < 1) ||
      Number(inventory.attributes.locations?.[watchedLocation]?.available) < 1)
  const isParent = product.data.meta?.product_types?.[0] === "parent";

  const selectedLocationInventory = watchedLocation
    ? inventory?.attributes?.locations?.[watchedLocation]?.available
    : inventory?.attributes?.available
  const maxQty = Number(selectedLocationInventory ?? 0)

  const selectedLocation = locations?.find(location =>
    location.attributes.slug === watchedLocation
  );

  // A parent stands for the whole family until the shopper picks a variation,
  // so it quotes its variants rather than its own price — which can be a price
  // none of them charges. The children are already loaded with the page.
  const childPrices = (variationProducts?.data ?? []).map((child) => ({
    amount: child.meta?.display_price?.without_tax?.amount,
    formattedPrice: child.meta?.display_price?.without_tax?.formatted,
  }));
  const familyFormattedPrice = isParent
    ? resolveFamilyPrice(childPrices)
    : undefined;
  const familyPrice = familyFormattedPrice
    ? {
        formatted: familyFormattedPrice,
        currency:
          variationProducts?.data?.find(
            (child) => child.meta?.display_price?.without_tax?.currency,
          )?.meta?.display_price?.without_tax?.currency,
      }
    : undefined;

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        <div className="basis-full lg:basis-1/2">
          {media && <ProductCarousel media={media} />}
        </div>
        <div className="basis-full lg:basis-1/2">
          <div className="flex flex-col gap-6 md:gap-10">
            <ProductSummary product={product.data} familyPrice={familyPrice} />
            <ProductVariations />
            <ProductDetails product={product.data} />
            {extensions && <ProductExtensions extensions={extensions} />}
            {!isParent && inventory?.attributes.locations && (
              <LocationSelector
                locations={inventory?.attributes.locations}
                locationList={locations}
              />
            )}
            <DisplayInventory
              selectedLocation={selectedLocation}
              inventoryData={inventory}
            />
            <QuantitySelector maxQty={maxQty} />
            <StatusButton
              type="submit"
              disabled={isParent || outOfStock}
              status={form.formState.isSubmitting ? "loading" : "idle"}
            >
              ADD TO CART
            </StatusButton>
          </div>
        </div>
      </div>
    </div>
  );
}
