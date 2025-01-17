import { Metadata } from "next";
import { ProductDetailsComponent, ProductProvider } from "./product-display";
import { getServerSideImplicitClient } from "../../../../lib/epcc-server-side-implicit-client";
import { getProductById } from "../../../../services/products";
import { notFound } from "next/navigation";
import { parseProductResponse } from "@elasticpath/react-shopper-hooks";
import React from "react";

import { RecommendedProducts } from "../../../../components/recommendations/RecommendationProducts";

export const dynamic = "force-dynamic";
const regexForUUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g

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

export default async function ProductPage({ params }: { params: { productSegment: string[] } }) {
  const client = getServerSideImplicitClient();
  console.debug("ProductPage", params);
  let product, productId, productSlug;

  //Canonical URL should be /product/[productSlug]/[productId] we search for that first
  if(params.productSegment.length === 2 && regexForUUID.test(params.productSegment[1])) {
    productId = params.productSegment[1];
    productSlug = params.productSegment[0];
    console.info(`Loading /product/${productSlug}/${productId}`);
    product = await getProductById(params.productSegment[1], client);

  }else if(params.productSegment.length === 1 && regexForUUID.test(params.productSegment[0])) {
    //Assume this is a legacy URL and product id is at slug 1
    console.warn(`Legacy URL detected ${params.productSegment[0]}, please update to use slug and id`);
    productId = params.productSegment[1];
    product = await getProductById(params.productSegment[0], client);

  }else if(params.productSegment.length === 1) {
    //TODO implement search by slug
    console.warn(`Using /product/${params.productSegment[0]} as slug:${regexForUUID.test(params.productSegment[0])}`);
    
    notFound();
  }


  if (!product) {
    notFound();
  }

  const shopperProduct = await parseProductResponse(product, client);

  return (
    <div
      className="px-4 xl:px-0 py-8 mx-auto max-w-[48rem] md:py-20 lg:max-w-[80rem] w-full"
      key={"page_" + productId?productId:productSlug}
    >
      <ProductProvider>
        <ProductDetailsComponent product={shopperProduct} />
        <RecommendedProducts product={shopperProduct} />
      </ProductProvider>
    </div>
  );
}
