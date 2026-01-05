import Price from "./Price";
import StrikePrice from "./StrikePrice";
import { Product } from "@epcc-sdk/sdks-shopper";
import { SkuChangeOpacityWrapper } from "./SkuChangeOpacityWrapper";

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
    </SkuChangeOpacityWrapper>
  );
};

export default ProductSummary;
