import ProductCarousel from "./carousel/ProductCarousel";
import ProductSummary from "./ProductSummary";
import ProductDetails from "./ProductDetails";
import ProductExtensions from "./ProductExtensions";
import CartActions from "./CartActions";
import { ReactElement } from "react";
import { ShopperProduct } from "@elasticpath/react-shopper-hooks";
import { Form } from "formik";

interface IProductContainer {
  product: ShopperProduct;
  children?: ReactElement;
}

export default function ProductContainer({
  product: { response, main_image, otherImages },
  children,
}: IProductContainer): JSX.Element {
  const { extensions } = response.attributes;
  return (
    <div>
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-10">
        <div className="basis-full lg:basis-1/2">
          {main_image && (
            <ProductCarousel images={otherImages} mainImage={main_image} />
          )}
        </div>
        <div className="basis-full lg:basis-1/2">
          <Form>
            <div className="flex flex-col gap-6 md:gap-10">
              <ProductSummary product={response} />
              {children}
              <ProductDetails product={response} />
              {extensions && <ProductExtensions extensions={extensions} />}
              <CartActions />
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
