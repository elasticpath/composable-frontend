import Price from "./Price";
import StrikePrice from "./StrikePrice";
import { Product } from "@epcc-sdk/sdks-shopper";
import { SkuChangeOpacityWrapper } from "./SkuChangeOpacityWrapper";
import { ProductMultibuyOffer } from "./ProductMultibuyOffer";

import type { JSX } from "react";

interface IProductSummary {
  product: Product;
  /** Shown instead of the product's own price, which a parent may not share with any variant. */
  familyPrice?: {
    formatted: string;
    currency?: string;
  };
}

const ProductSummary = ({
  product,
  familyPrice,
}: IProductSummary): JSX.Element => {
  const { attributes, meta } = product;

  return (
    <SkuChangeOpacityWrapper>
      <span className="text-xl font-semibold leading-[1.1] sm:text-3xl lg:text-4xl">
        {attributes?.name}
      </span>
      {(familyPrice || meta?.display_price) && (
        <div className="flex items-center">
          <Price
            price={familyPrice?.formatted ?? meta!.display_price!.without_tax?.formatted!}
            currency={
              familyPrice
                ? (familyPrice.currency ?? "")
                : meta!.display_price!.without_tax?.currency!
            }
            size="text-2xl"
          />
          {/* A family can be on sale too, so the previous price is shown either way. */}
          {meta?.original_display_price && (
            <StrikePrice
              price={meta?.original_display_price.without_tax?.formatted!}
              currency={meta?.original_display_price.without_tax?.currency!}
            />
          )}
        </div>
      )}
      {attributes && "tiers" in attributes && (
        <>
          <div className="uppercase font-bold mt-4 mb-4 text-lg text-red-700">
            Bulk Buy Offer
          </div>
          <ProductMultibuyOffer product={product} />
        </>
      )}
    </SkuChangeOpacityWrapper>
  );
};

export default ProductSummary;
