import Price from "./Price";
import StrikePrice from "./StrikePrice";
import { Product } from "@epcc-sdk/sdks-shopper";
import { SkuChangeOpacityWrapper } from "./SkuChangeOpacityWrapper";
import { ProductMultibuyOffer } from "./ProductMultibuyOffer";

import type { JSX } from "react";

interface IProductSummary {
  product: Product;
}

const ProductSummary = ({ product }: IProductSummary): JSX.Element => {
  const { attributes, meta } = product;

  return (
    <SkuChangeOpacityWrapper>
      <span className="text-xl font-semibold leading-[1.1] sm:text-3xl lg:text-4xl">
        {attributes?.name}
      </span>
      {meta?.display_price && (
        <div className="flex items-center">
          <Price
            price={meta.display_price.without_tax?.formatted!}
            currency={meta.display_price.without_tax?.currency!}
            size="text-2xl"
          />
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
