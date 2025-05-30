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

export function SimpleProductContent() {
  const form = useFormContext();
  const { product, inventory, media } = useShopperProductContext();
  const extensions = product.data?.attributes?.extensions;

  const watchedLocation = form.watch("location");

  if (!product.data) {
    return null;
  }

  const outOfStock =
    !inventory?.attributes.locations ||
    Number(inventory.attributes.locations[watchedLocation]?.available) < 1;

  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        <div className="basis-full lg:basis-1/2">
          {media && <ProductCarousel media={media} />}
        </div>
        <div className="basis-full lg:basis-1/2">
          <div className="flex flex-col gap-6 md:gap-10">
            <ProductSummary product={product.data} />
            <ProductDetails product={product.data} />
            {extensions && <ProductExtensions extensions={extensions} />}
            {inventory?.attributes.locations && (
              <LocationSelector locations={inventory?.attributes.locations} />
            )}
            <StatusButton
              type="submit"
              disabled={outOfStock}
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
