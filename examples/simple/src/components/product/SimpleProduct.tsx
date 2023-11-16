import type { SimpleProduct } from "@elasticpath/react-shopper-hooks";
import ProductContainer from "./ProductContainer";
import { useCallback } from "react";
import {
  SimpleProductProvider,
  useCart,
  useSimpleProduct,
} from "@elasticpath/react-shopper-hooks";
import { Formik } from "formik";

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
  const { addProductToCart } = useCart();
  const { product } = useSimpleProduct();

  const submit = useCallback(async () => {
    await addProductToCart(product.response.id, 1);
  }, [product, addProductToCart]);

  return (
    <Formik
      initialValues={{}}
      onSubmit={async () => {
        await submit();
      }}
    >
      <ProductContainer product={product} />
    </Formik>
  );
}

export default SimpleProductDetail;
