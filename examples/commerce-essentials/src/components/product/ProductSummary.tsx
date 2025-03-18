import type { ShopperProduct } from "@elasticpath/react-shopper-hooks";
import clsx from "clsx";
import { useContext } from "react";
import { ProductContext } from "../../lib/product-context";
import PriceDisplay, { SalePriceDisplayStyle } from "./PriceDisplay";

interface IProductSummary {
  product: ShopperProduct["response"];
}

const ProductSummary = ({ product }: IProductSummary): JSX.Element => {
  const {
    attributes,
    meta: { display_price, original_display_price },
  } = product;
  const context = useContext(ProductContext);
  let displayPrice = null,
    originalPrice = null;
  if (display_price?.without_tax) {
    displayPrice = display_price.without_tax;
    originalPrice = original_display_price?.without_tax;
  } else if (display_price?.with_tax) {
    displayPrice = display_price.with_tax;
    originalPrice = original_display_price?.with_tax;
  }
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
