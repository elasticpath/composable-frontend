import { useContext } from "react";
import clsx from "clsx";
import type { ShopperProduct } from "@elasticpath/react-shopper-hooks";
import { ProductContext } from "../../lib/product-context";

interface IProductDetails {
  product: ShopperProduct["response"];
}

const ProductDetails = ({ product }: IProductDetails): JSX.Element => {
  const context = useContext(ProductContext);

  return (
    <div
      className={clsx(
        "flex flex-col gap-4 sm:gap-6",
        context?.isChangingSku && "opacity-20 cursor-default",
      )}
    >
      <span className="text-base font-medium uppercase lg:text-lg">
        Product Details
      </span>
      {product.attributes.description}
    </div>
  );
};

export default ProductDetails;
