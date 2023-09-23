import type { GetStaticPaths } from "next";
import { ParsedUrlQuery } from "querystring";
import ChildProductDetail from "../../components/product/ChildProduct";
import BaseProductDetail from "../../components/product/BaseProduct";
import {
  isChildProductResource,
  isSimpleProductResource,
} from "../../lib/product-helper";
import { getProductById } from "../../services/products";
import SimpleProductDetail from "../../components/product/SimpleProduct";
import { ProductContext } from "../../lib/product-util";
import React, { ReactElement, useState } from "react";
import type { IProduct } from "../../lib/types/product-types";

import { withStoreStaticProps } from "../../lib/store-wrapper-ssg";
import {
  retrieveBaseProps,
  retrieveChildProps,
  retrieveSimpleProps,
} from "../../lib/retrieve-product-props";
import Head from "next/head";
import { NextPageWithLayout } from "../_app";
import MainLayout, {
  MAIN_LAYOUT_TITLE,
} from "../../components/layouts/MainLayout";

export const Product: NextPageWithLayout<IProduct> = (props: IProduct) => {
  const [isChangingSku, setIsChangingSku] = useState(false);

  const { product } = props;

  return (
    <div
      className="py-18 mx-auto max-w-[48rem] md:py-20 lg:max-w-[80rem] w-full"
      key={"page_" + product.id}
    >
      <ProductContext.Provider
        value={{
          isChangingSku,
          setIsChangingSku,
        }}
      >
        {resolveProductDetailComponent(props)}
      </ProductContext.Provider>
    </div>
  );
};

Product.getLayout = function getLayout(page: ReactElement, pageProps, ctx?) {
  return (
    <>
      <MainLayout nav={ctx?.nav ?? []}>{page}</MainLayout>
      <Head>
        <title>
          {`${MAIN_LAYOUT_TITLE} - ${pageProps.product.attributes.name}`}
        </title>
        <meta
          name="description"
          content={pageProps.product.attributes.description}
        />
        <meta
          property="og:title"
          content={`${MAIN_LAYOUT_TITLE} - ${pageProps.product.attributes.name}`}
        />
        <meta
          property="og:description"
          content={pageProps.product.attributes.description}
        />
      </Head>
    </>
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

interface ProductRouteParams extends ParsedUrlQuery {
  productId: string;
}

export const getStaticProps = withStoreStaticProps<
  IProduct,
  ProductRouteParams
>(async ({ params }) => {
  if (!params) {
    return {
      notFound: true,
    };
  }

  const product = await getProductById(params.productId);

  if (!product) {
    return {
      notFound: true,
    };
  }

  const productData = product.data;

  const retrievedResults = isSimpleProductResource(productData)
    ? retrieveSimpleProps(product)
    : isChildProductResource(productData)
    ? await retrieveChildProps(product)
    : await retrieveBaseProps(product);

  return {
    ...retrievedResults,
    revalidate: 60,
  };
});

export const getStaticPaths: GetStaticPaths<ProductRouteParams> = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default Product;
