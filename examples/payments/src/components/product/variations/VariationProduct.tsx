import {
  useCart,
  useVariationProduct,
  VariationProduct,
  VariationProductProvider,
} from "@elasticpath/react-shopper-hooks";
import { useCallback } from "react";
import { Formik } from "formik";
import ProductContainer from "../ProductContainer";
import ProductVariations from "./ProductVariations";

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
  const { addProductToCart } = useCart();
  const { product } = useVariationProduct();

  const {
    response: { id },
  } = product;

  const submit = useCallback(async () => {
    await addProductToCart(id, 1);
  }, [id, addProductToCart]);

  return (
    <Formik initialValues={{}} onSubmit={async () => submit()}>
      <ProductContainer product={product}>
        <ProductVariations />
      </ProductContainer>
    </Formik>
  );
}
