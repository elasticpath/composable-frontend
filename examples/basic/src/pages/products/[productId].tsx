import type { GetStaticPaths } from "next";
import { ParsedUrlQuery } from "querystring";

import { getProductById } from "../../services/products";
import SimpleProductDetail from "../../components/product/SimpleProduct";
import { ProductContext } from "../../lib/product-util";
import React, { ReactElement, useState } from "react";
import type { ShopperProduct } from "@elasticpath/react-shopper-hooks";

import { withStoreStaticProps } from "../../lib/store-wrapper-ssg";
import Head from "next/head";
import { NextPageWithLayout } from "../_app";
import MainLayout, {
  MAIN_LAYOUT_TITLE,
} from "../../components/layouts/MainLayout";
import BundleProductDetail from "../../components/product/bundles/BundleProduct";
import { parseProductResponse } from "@elasticpath/react-shopper-hooks";
import { getEpccImplicitClient } from "../../lib/epcc-implicit-client";
import { VariationProductDetail } from "../../components/product/variations/VariationProduct";

interface ProductPageProps {
  product: ShopperProduct;
}

export const Product: NextPageWithLayout<ProductPageProps> = (props) => {
  const [isChangingSku, setIsChangingSku] = useState(false);

  const { product } = props;

  return (
    <div
      className="py-18 mx-auto max-w-[48rem] md:py-20 lg:max-w-[80rem] w-full"
      key={"page_" + product.response.id}
    >
      <ProductContext.Provider
        value={{
          isChangingSku,
          setIsChangingSku,
        }}
      >
        {resolveProductDetailComponent(product)}
      </ProductContext.Provider>
    </div>
  );
};

Product.getLayout = function getLayout(page: ReactElement, pageProps, ctx?) {
  const {
    attributes: { name, description },
  } = pageProps.product.response;

  return (
    <>
      <MainLayout nav={ctx?.nav ?? []}>{page}</MainLayout>
      <Head>
        <title>{`${MAIN_LAYOUT_TITLE} - ${name}`}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${MAIN_LAYOUT_TITLE} - ${name}`} />
        <meta property="og:description" content={description} />
      </Head>
    </>
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

interface ProductRouteParams extends ParsedUrlQuery {
  productId: string;
}

export const getStaticProps = withStoreStaticProps<
  ProductPageProps,
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

  const shopperProduct = await parseProductResponse(
    product,
    getEpccImplicitClient(),
  );

  return {
    props: {
      product: shopperProduct,
    },
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
