import { Metadata } from "next";
import { ProductDetailsComponent, ProductProvider } from "./product-display";
import { getServerSideImplicitClient } from "../../../../lib/epcc-server-side-implicit-client";
import { getProductById } from "../../../../services/products";
import { notFound } from "next/navigation";
import { parseProductResponse } from "@elasticpath/react-shopper-hooks";
import React from "react";
import { getSubscriptionOfferingsByProductId } from "../../../../services/subscriptions";

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
  console.log(`product: ${JSON.stringify(product, null, 2)}`);
  let productId = params.productId;
  if (!product.data.attributes.base_product) {
    productId = product.data.attributes.base_product_id;
  }
  console.log(`productId: ${productId}`);
  const { offerings:subscriptionOfferings, plans } = await getSubscriptionOfferingsByProductId(client, productId);
  // console.log(`subscriptionOfferings: ${JSON.stringify(subscriptionOfferings, null, 2)}`);
  // console.log(`plans: ${JSON.stringify(plans, null, 2)}`);
  subscriptionOfferings.forEach((offering, index) => {
    console.log(`Offering ${index + 1}:`, {
      id: offering.id,
      name: offering.attributes?.name,
      description: offering.attributes?.description,
    });
  });
  plans.forEach((plan, index) => {
    console.log(`Plan ${index + 1}:`, {
      id: plan.id,
      name: plan.attributes?.name,
      description: plan.attributes?.description,
      interval: plan.attributes?.billing_interval_type,
      price: plan.meta?.display_price.with_tax.currency + " " + plan.meta?.display_price.with_tax.formatted
    });
  });

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
        <ProductDetailsComponent 
          product={shopperProduct} 
          subscriptionOfferings={subscriptionOfferings}
          plans={plans}
        />
      </ProductProvider>
    </div>
  );
}
