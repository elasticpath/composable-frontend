"use client";
import ProductComponents from "./ProductComponents";
import { Form, Formik } from "formik";
import {
  BundleProduct,
  BundleProductProvider,
  useBundle,
  useCartAddBundleItem,
} from "@elasticpath/react-shopper-hooks";
import { useCallback, useMemo } from "react";
import {
  FormSelectedOptions,
  formSelectedOptionsToData,
  selectedOptionsToFormValues,
} from "./form-parsers";
import { createBundleFormSchema } from "./validation-schema";
import { toFormikValidate } from "zod-formik-adapter";
import ProductCarousel from "../carousel/ProductCarousel";
import ProductSummary from "../ProductSummary";
import ProductDetails from "../ProductDetails";
import ProductExtensions from "../ProductExtensions";
import { StatusButton } from "../../button/StatusButton";

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

  const { mutate, isPending } = useCartAddBundleItem();

  const submit = useCallback(
    async (values: { selectedOptions: FormSelectedOptions }) => {
      mutate({
        productId: configuredProduct.response.id,
        selectedOptions: formSelectedOptionsToData(values.selectedOptions),
        quantity: 1,
      });
    },
    [configuredProduct.response.id, mutate],
  );

  const validationSchema = useMemo(
    () => createBundleFormSchema(components),
    [components],
  );

  const { response, main_image, otherImages } = configuredProduct;
  const { extensions } = response.attributes;
  return (
    <Formik
      initialValues={{
        selectedOptions: selectedOptionsToFormValues(selectedOptions),
      }}
      validate={toFormikValidate(validationSchema)}
      onSubmit={async (values) => submit(values)}
    >
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
                <ProductComponents />
                <ProductDetails product={response} />
                {extensions && <ProductExtensions extensions={extensions} />}
                <StatusButton
                  type="submit"
                  status={isPending ? "loading" : "idle"}
                >
                  ADD TO CART
                </StatusButton>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </Formik>
  );
}

export default BundleProductDetail;
