import { useContext } from "react";
import Price from "./Price";
import StrikePrice from "./StrikePrice";
import clsx from "clsx";
import type { ShopperProduct } from "@elasticpath/react-shopper-hooks";
import { ProductContext } from "../../lib/product-context";

interface IProductSummary {
  product: ShopperProduct["response"];
}

const ProductSummary = ({ product }: IProductSummary): JSX.Element => {
  const {
    attributes,
    meta: { display_price, original_display_price },
  } = product;
  const context = useContext(ProductContext);

  return (
    <div
      className={clsx(context?.isChangingSku && "opacity-20 cursor-default")}
    >
      <span className="text-xl font-semibold leading-[1.1] sm:text-3xl lg:text-4xl">
        {attributes.name}
      </span>
      {display_price && (
        <div className="flex items-center">
          <Price
            price={display_price.without_tax.formatted}
            currency={display_price.without_tax.currency}
            size="text-2xl"
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
