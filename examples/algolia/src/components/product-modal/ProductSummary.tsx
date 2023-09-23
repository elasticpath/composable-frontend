import type { ProductResponse } from "@moltin/sdk";
import clsx from "clsx";
import { useContext } from "react";
import { ProductContext } from "../../lib/product-util";
import Price from "../product/Price";
import StrikePrice from "../product/StrikePrice";

interface IProductSummary {
  product: ProductResponse;
}

const ProductSummary = ({ product }: IProductSummary): JSX.Element => {
  const {
    attributes,
    meta: { display_price, original_display_price },
  } = product;
  const context = useContext(ProductContext);

  return (
    <div
      className={clsx(
        context?.isChangingSku && "opacity-20 cursor-default",
        "flex flex-col",
      )}
    >
      <span className="text-xl font-semibold">{attributes.name}</span>
      {display_price && (
        <div className="flex items-center">
          <Price
            price={display_price.without_tax.formatted}
            currency={display_price.without_tax.currency}
            size="text-lg"
          />
          {original_display_price && (
            <StrikePrice
              price={original_display_price.without_tax.formatted}
              currency={original_display_price.without_tax.currency}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ProductSummary;
