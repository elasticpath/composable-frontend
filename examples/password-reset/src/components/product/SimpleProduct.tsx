"use client";
import type { SimpleProduct } from "@elasticpath/react-shopper-hooks";
import {
  SimpleProductProvider,
  useCartAddProduct,
  useSimpleProduct,
} from "@elasticpath/react-shopper-hooks";
import ProductCarousel from "./carousel/ProductCarousel";
import ProductSummary from "./ProductSummary";
import ProductDetails from "./ProductDetails";
import ProductExtensions from "./ProductExtensions";
import { StatusButton } from "../button/StatusButton";

interface ISimpleProductDetail {
  simpleProduct: SimpleProduct;
}

function SimpleProductDetail({
  simpleProduct,
}: ISimpleProductDetail): JSX.Element {
  return (
    <SimpleProductProvider simpleProduct={simpleProduct}>
      <SimpleProductContainer />
    </SimpleProductProvider>
  );
}

function SimpleProductContainer(): JSX.Element {
  const { product } = useSimpleProduct();
  const { mutate, isPending } = useCartAddProduct();

  const { main_image, response, otherImages } = product;
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
          <div className="flex flex-col gap-6 md:gap-10">
            <ProductSummary product={response} />
            <ProductDetails product={response} />
            {extensions && <ProductExtensions extensions={extensions} />}
            <StatusButton
              type="button"
              onClick={() => mutate({ productId: response.id, quantity: 1 })}
              status={isPending ? "loading" : "idle"}
            >
              ADD TO CART
            </StatusButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleProductDetail;
