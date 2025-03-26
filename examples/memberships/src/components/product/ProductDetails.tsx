import clsx from "clsx";
import { Product } from "@epcc-sdk/sdks-shopper";
import { SkuChangeOpacityWrapper } from "./SkuChangeOpacityWrapper";

import type { JSX } from "react";

interface IProductDetails {
  product: Product;
}

const ProductDetails = ({ product }: IProductDetails): JSX.Element => {
  return (
    <SkuChangeOpacityWrapper className={clsx("flex flex-col gap-4 sm:gap-6")}>
      <span className="text-base font-medium uppercase lg:text-lg">
        Product Details
      </span>
      {product.attributes?.description}
    </SkuChangeOpacityWrapper>
  );
};

export default ProductDetails;
