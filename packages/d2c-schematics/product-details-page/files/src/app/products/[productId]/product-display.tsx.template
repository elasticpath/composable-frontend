"use client";
import React, { ReactElement, useState } from "react";
import { ShopperProduct } from "@elasticpath/react-shopper-hooks";
import { VariationProductDetail } from "../../../components/product/variations/VariationProduct";
import BundleProductDetail from "../../../components/product/bundles/BundleProduct";
import { ProductContext } from "../../../lib/product-context";
import SimpleProductDetail from "../../../components/product/SimpleProduct";

export function ProductDisplay({
  product,
}: {
  product: ShopperProduct;
}): ReactElement {
  const [isChangingSku, setIsChangingSku] = useState(false);

  return (
    <ProductContext.Provider
      value={{
        isChangingSku,
        setIsChangingSku,
      }}
    >
      {resolveProductDetailComponent(product)}
    </ProductContext.Provider>
  );
}

function resolveProductDetailComponent(product: ShopperProduct): JSX.Element {
  switch (product.kind) {
    case "base-product":
      return <VariationProductDetail variationProduct={product} />;
    case "child-product":
      return <VariationProductDetail variationProduct={product} />;
    case "simple-product":
      return <SimpleProductDetail simpleProduct={product} />;
    case "bundle-product":
      return <BundleProductDetail bundleProduct={product} />;
  }
}
