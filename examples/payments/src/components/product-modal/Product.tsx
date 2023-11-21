import type { NextPage } from "next";
import { useEffect, useState } from "react";
import type { ShopperProduct } from "@elasticpath/react-shopper-hooks";
import BundleProductDetail from "../product/bundles/BundleProduct";
import SimpleProductDetail from "../product/SimpleProduct";
import { VariationProductDetail } from "../product/variations/VariationProduct";
import { ProductModalContext } from "../../lib/product-context";

interface ModalProductProps {
  onSkuIdChange: (id: string) => void;
}

export const Product: NextPage<ShopperProduct & ModalProductProps> = (
  props: ShopperProduct & ModalProductProps,
) => {
  const [isChangingSku, setIsChangingSku] = useState(false);
  const [changedSkuId, setChangedSkuId] = useState("");

  const { response } = props;

  useEffect(() => {
    if (changedSkuId && props.onSkuIdChange) {
      props.onSkuIdChange(changedSkuId);
    }
  }, [changedSkuId, props]);

  return (
    <div className="max-w-base-max-width" key={"page_" + response.id}>
      <ProductModalContext.Provider
        value={{
          isChangingSku,
          setIsChangingSku,
          changedSkuId,
          setChangedSkuId,
        }}
      >
        {resolveProductDetailComponent(props)}
      </ProductModalContext.Provider>
    </div>
  );
};

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

export default Product;
