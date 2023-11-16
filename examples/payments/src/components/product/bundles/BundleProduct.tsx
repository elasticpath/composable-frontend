import ProductComponents from "./ProductComponents";
import ProductContainer from "../ProductContainer";
import { Formik } from "formik";
import {
  BundleProduct,
  BundleProductProvider,
  useBundle,
  useCart,
} from "@elasticpath/react-shopper-hooks";
import { useCallback, useMemo } from "react";
import {
  FormSelectedOptions,
  formSelectedOptionsToData,
  selectedOptionsToFormValues,
} from "./form-parsers";
import { createBundleFormSchema } from "./validation-schema";
import { toFormikValidate } from "zod-formik-adapter";

interface IBundleProductDetail {
  bundleProduct: BundleProduct;
}

const BundleProductDetail = ({
  bundleProduct,
}: IBundleProductDetail): JSX.Element => {
  return (
    <BundleProductProvider bundleProduct={bundleProduct}>
      <BundleProductContainer />
    </BundleProductProvider>
  );
};

function BundleProductContainer(): JSX.Element {
  const { configuredProduct, selectedOptions, components } = useBundle();
  const { addBundleProductToCart } = useCart();

  const submit = useCallback(
    async (values: { selectedOptions: FormSelectedOptions }) => {
      await addBundleProductToCart(
        configuredProduct.response.id,
        formSelectedOptionsToData(values.selectedOptions),
        1,
      );
    },
    [addBundleProductToCart, configuredProduct.response.id],
  );

  const validationSchema = useMemo(
    () => createBundleFormSchema(components),
    [components],
  );

  return (
    <Formik
      initialValues={{
        selectedOptions: selectedOptionsToFormValues(selectedOptions),
      }}
      validate={toFormikValidate(validationSchema)}
      onSubmit={async (values) => submit(values)}
    >
      <ProductContainer product={configuredProduct}>
        <ProductComponents />
      </ProductContainer>
    </Formik>
  );
}

export default BundleProductDetail;
