import type { ShopperProduct } from "@elasticpath/react-shopper-hooks";
import clsx from "clsx";
import { useContext } from "react";
import { ProductContext } from "../../lib/product-context";
import PriceDisplay, { SalePriceDisplayStyle } from "./PriceDisplay";
import { getProductDisplayPrices } from "../../lib/product-helper";
import { ProductResponse } from "@elasticpath/js-sdk";

interface IProductSummary {
  product: ShopperProduct["response"];
}

const ProductSummary = ({ product }: IProductSummary): JSX.Element => {
  const {
    attributes,
  } = product;
  const context = useContext(ProductContext);
  const { displayPrice, originalPrice } = getProductDisplayPrices(
    product as ProductResponse,
  );
  return (
    <div
      className={clsx(context?.isChangingSku && "opacity-20 cursor-default")}
    >
      <span className="text-xl font-semibold leading-[1.1] sm:text-3xl lg:text-4xl">
        {attributes.name}
      </span>
      <div className="flex items-center">
        <PriceDisplay
          display_price={displayPrice}
          original_display_price={originalPrice}
          showCurrency={false}
          salePriceDisplay={SalePriceDisplayStyle.strikePriceWithCalcValue}
        />
      </div>
    </div>
  );
};

export default ProductSummary;
