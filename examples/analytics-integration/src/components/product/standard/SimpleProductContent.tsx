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
import { sendGAEvent } from '@next/third-parties/google'

export function SimpleProductContent() {
  const form = useFormContext();
  const { product, inventory, media } = useShopperProductContext();
  // Bound to a const so the guard below narrows inside the click handler too.
  const productData = product.data;
  const extensions = productData?.attributes?.extensions;

  const watchedLocation = form.watch("location");

  if (!productData) {
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
            <ProductSummary product={productData} />
            <ProductDetails product={productData} />
            {extensions && <ProductExtensions extensions={extensions} />}
            {inventory?.attributes.locations && (
              <LocationSelector locations={inventory?.attributes.locations} />
            )}
            <StatusButton
              type="submit"
              disabled={outOfStock}
              status={form.formState.isSubmitting ? "loading" : "idle"}
              onClick={() => {
                // Example event tracking for Google Analytics
                if (process.env.NEXT_PUBLIC_GA_ID) {
                  sendGAEvent("event", "Added product to cart", {
                    value: productData.attributes?.name || productData.id,
                  });
                }
              }}
            >
              ADD TO CART
            </StatusButton>
          </div>
        </div>
      </div>
    </div>
  );
}
