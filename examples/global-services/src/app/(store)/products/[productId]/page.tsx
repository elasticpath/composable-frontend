import { Metadata } from "next";
import { ProductDetailsComponent, ProductProvider } from "./product-display";
import { getServerSideImplicitClient } from "../../../../lib/epcc-server-side-implicit-client";
import { getProductById } from "../../../../services/products";
import { notFound } from "next/navigation";
import { parseProductResponse } from "@elasticpath/react-shopper-hooks";
import React from "react";

  import { RecommendedProducts } from "../../../../components/recommendations/RecommendationProducts";

export const dynamic = "force-dynamic";

type Props = {
  params: { productId: string };
};

export async function generateMetadata({
  params: { productId },
}: Props): Promise<Metadata> {
  const client = getServerSideImplicitClient();
  const product = await getProductById(productId, client);

  if (!product) {
    notFound();
  }

  return {
    title: product.data.attributes.name,
    description: product.data.attributes.description,
  };
}

export default async function ProductPage({ params }: Props) {
  const client = getServerSideImplicitClient();
  const product = await getProductById(params.productId, client);

  if (!product) {
    notFound();
  }

  const shopperProduct = await parseProductResponse(product, client);

  return (
    <div
      className="px-4 xl:px-0 py-8 mx-auto max-w-[48rem] md:py-20 lg:max-w-[80rem] w-full"
      key={"page_" + params.productId}
    >
      <ProductProvider>
        <ProductDetailsComponent product={shopperProduct} />
        <RecommendedProducts product={shopperProduct} />
      </ProductProvider>
    </div>
  );
}
