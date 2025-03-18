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

  return (
    <div
      className={clsx(context?.isChangingSku && "opacity-20 cursor-default")}
    >
      <span className="text-xl font-semibold leading-[1.1] sm:text-3xl lg:text-4xl">
        {attributes.name}
      </span>
      {display_price?.without_tax && (
        <div className="flex items-center">
          <PriceDisplay
            display_price={display_price.without_tax}
            original_display_price={original_display_price?.without_tax}
            showCurrency={false}
            salePriceDisplay={SalePriceDisplayStyle.strikePriceWithCalcPercent}
          />
        </div>
      )}
      {display_price?.with_tax && (
        <div className="flex items-center">
          <PriceDisplay
            display_price={display_price.with_tax}
            original_display_price={original_display_price?.with_tax}
            showCurrency={false}
            salePriceDisplay={SalePriceDisplayStyle.strikePriceWithCalcPercent}
          />
        </div>
      )}
    </div>
  );
};

export default ProductSummary;
