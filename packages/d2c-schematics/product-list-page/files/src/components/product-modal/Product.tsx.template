import { Container } from "@chakra-ui/react";
import type { NextPage } from "next";
import { ProductModalContext } from "../../lib/product-util";
import { useEffect, useState } from "react";
import type { IProduct } from "../../lib/types/product-types";
import BaseProductDetail from "./BaseProduct";
import ChildProductDetail from "./ChildProduct";
import SimpleProductDetail from "./SimpleProduct";

interface ModalProductProps {
  onSkuIdChange: (id: string) => void;
  onCloseModal: () => void;
}

export const Product: NextPage<IProduct & ModalProductProps> = (
  props: IProduct & ModalProductProps
) => {
  const [isChangingSku, setIsChangingSku] = useState(false);
  const [changedSkuId, setChangedSkuId] = useState("");

  const { product } = props;

  useEffect(() => {
    if (changedSkuId && props.onSkuIdChange) {
      props.onSkuIdChange(changedSkuId);
    }
  }, [changedSkuId]);

  return (
    <Container maxW="7xl" key={"page_" + product.id}>
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
    </Container>
  );
};

function resolveProductDetailComponent(props: IProduct): JSX.Element {
  switch (props.kind) {
    case "base-product":
      return <BaseProductDetail baseProduct={props} />;
    case "child-product":
      return <ChildProductDetail childProduct={props} />;
    case "simple-product":
      return <SimpleProductDetail simpleProduct={props} />;
  }
}

export default Product;
