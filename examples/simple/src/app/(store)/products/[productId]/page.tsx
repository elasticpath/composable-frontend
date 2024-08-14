import { Metadata } from "next";
import { ProductDetailsComponent, ProductProvider } from "./product-display";
import { getServerSideImplicitClient } from "../../../../lib/epcc-server-side-implicit-client";
import { notFound } from "next/navigation";
import { parseProductResponse } from "@elasticpath/react-shopper-hooks";
import React from "react";
import { getByContextProduct, createClient } from "@epcc-sdk/sdks-shopper";
import { applyDefaultNextMiddleware } from "@epcc-sdk/sdks-nextjs";
import { epccEnv } from "../../../../lib/resolve-epcc-env";
import { ProductResponse, ShopperCatalogResource } from "@elasticpath/js-sdk";

export const dynamic = "force-dynamic";

type Props = {
  params: { productId: string };
};

createClient({
  baseUrl: `https://${epccEnv.host}`,
});

applyDefaultNextMiddleware();

export async function generateMetadata({
  params: { productId },
}: Props): Promise<Metadata> {
  const productResponse = await getByContextProduct({
    path: {
      product_id: productId,
    },
    query: {
      include: ["main_images", "files", "component_products"],
    },
  });

  if (!productResponse.data) {
    notFound();
  }

  const product = productResponse.data;

  return {
    title: product.data?.attributes?.name,
    description: product.data?.attributes?.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const client = getServerSideImplicitClient();
  const productResponse = await getByContextProduct({
    path: {
      product_id: params.productId,
    },
    query: {
      include: ["main_images", "files", "component_products"],
    },
  });

  if (!productResponse.data) {
    notFound();
  }

  const product = productResponse.data;

  // TODO I want to replace the ShopperProduct concept and just use the sdk types that are provided
  const shopperProduct = await parseProductResponse(
    product as unknown as ShopperCatalogResource<ProductResponse>,
    client,
  );

  return (
    <div
      className="px-4 xl:px-0 py-8 mx-auto max-w-[48rem] md:py-20 lg:max-w-[80rem] w-full"
      key={"page_" + params.productId}
    >
      <ProductProvider>
        <ProductDetailsComponent product={shopperProduct} />
      </ProductProvider>
    </div>
  );
}
