"use client";
import {
  useCartAddProduct,
  useVariationProduct,
  VariationProduct,
  VariationProductProvider,
} from "@elasticpath/react-shopper-hooks";
import ProductVariations from "./ProductVariations";
import ProductCarousel from "../carousel/ProductCarousel";
import ProductSummary from "../ProductSummary";
import ProductDetails from "../ProductDetails";
import ProductExtensions from "../ProductExtensions";
import { StatusButton } from "../../button/StatusButton";

export const VariationProductDetail = ({
  variationProduct,
}: {
  variationProduct: VariationProduct;
}): JSX.Element => {
  return (
    <VariationProductProvider variationProduct={variationProduct}>
      <VariationProductContainer />
    </VariationProductProvider>
  );
};

export function VariationProductContainer(): JSX.Element {
  const { product } = useVariationProduct();
  const { mutate, isPending } = useCartAddProduct();

  const { response, main_image, otherImages } = product;
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
            <ProductVariations />
            <ProductDetails product={response} />
            {extensions && <ProductExtensions extensions={extensions} />}
            <StatusButton
              disabled={product.kind === "base-product"}
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
