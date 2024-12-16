"use client";
import React, { ReactElement, ReactNode, useState } from "react";
import { ShopperProduct } from "@elasticpath/react-shopper-hooks";
import { VariationProductDetail } from "../../../../components/product/variations/VariationProduct";
import BundleProductDetail from "../../../../components/product/bundles/BundleProduct";
import { ProductContext } from "../../../../lib/product-context";
import SimpleProductDetail from "../../../../components/product/SimpleProduct";

export function ProductProvider({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  const [isChangingSku, setIsChangingSku] = useState(false);

  return (
    <ProductContext.Provider
      value={{
        isChangingSku,
        setIsChangingSku,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function resolveProductDetailComponent(
  product: ShopperProduct,
): JSX.Element {
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

export function ProductDetailsComponent({
  product,
}: {
  product: ShopperProduct;
}) {
  return resolveProductDetailComponent(product);
}
