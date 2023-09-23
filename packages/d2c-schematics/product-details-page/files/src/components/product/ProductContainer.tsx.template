import ProductCarousel from "./carousel/ProductCarousel";
import ProductSummary from "./ProductSummary";
import ProductDetails from "./ProductDetails";
import ProductExtensions from "./ProductExtensions";
import CartActions from "./CartActions";
import { IBase } from "../../lib/types/product-types";
import { ReactElement } from "react";

interface IProductContainer {
  productBase: IBase;
  children?: ReactElement;
}

export default function ProductContainer({
  productBase: { product, main_image, otherImages },
  children,
}: IProductContainer): JSX.Element {
  const { extensions } = product.attributes;
  return (
    <div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-10">
        {main_image && (
          <ProductCarousel images={otherImages} mainImage={main_image} />
        )}
        <div className="flex flex-col gap-6 md:gap-10">
          <ProductSummary product={product} />
          {children}
          <ProductDetails product={product} />
          {extensions && <ProductExtensions extensions={extensions} />}
          <CartActions productId={product.id} />
        </div>
      </div>
    </div>
  );
}
