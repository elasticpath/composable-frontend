import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSideImplicitClient } from "../../../../lib/epcc-server-side-implicit-client";
import { getProductById } from "../../../../services/products";
import { ProductDetailsComponent, ProductProvider } from "./product-display";

import { ElasticPath } from "@elasticpath/js-sdk";
import ProductSchema from "../../../../components/product/schema/ProductSchema";
import { RecommendedProducts } from "../../../../components/recommendations/RecommendationProducts";
import {
  getProductKeywords,
  getProductURLSegment,
  parseProductResponseVariationWrapper,
} from "../../../../lib/product-helper";

export const dynamic = "force-dynamic";
const regexForUUID =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

type Props = {
  params: { productId: string };
};

export async function generateMetadata({
  params,
}: {
  params: { productSegment: string[] };
}): Promise<Metadata> {
  const client = getServerSideImplicitClient();
  let product, productId, productSlug;
  //Canonical URL should be /product/[productSlug]/[productId] we search for that first
  ({ productId, productSlug, product } = await getProduct(
    params,
    productId,
    productSlug,
    product,
    client,
  ));
  const canonicalURL = getProductURLSegment({
    id: productId,
    attributes: { slug: productSlug },
  });

  return {
    title: product.data.attributes.name,
    description: product.data.attributes.description,
    keywords: getProductKeywords(product),
    alternates: {
      canonical: canonicalURL,
    },
  };
}

export default async function ProductPage({ params }: { params: { productSegment: string[] } }) {
  const client = getServerSideImplicitClient();
  console.debug("ProductPage", params);
  let product, productId, productSlug;

  //Canonical URL should be /product/[productSlug]/[productId] we search for that first
  ({ productId, productSlug, product } = await getProduct(params, productId, productSlug, product, client));


  if (!product) {
    notFound();
  }

  const shopperProduct = await parseProductResponseVariationWrapper(product, client);

  return (
    <div
      className="px-4 xl:px-0 py-8 mx-auto max-w-[48rem] md:py-20 lg:max-w-[80rem] w-full"
      key={"page_" + productId ? productId : productSlug}
    >
      <ProductProvider>
        <ProductSchema product={shopperProduct} />
        <ProductDetailsComponent product={shopperProduct} />
        <RecommendedProducts product={shopperProduct} />
      </ProductProvider>
    </div>
  );
}
async function getProduct(params: { productSegment: string[]; }, productId: any, productSlug: any, product: any, client: ElasticPath) {
  if (params.productSegment.length === 2 && regexForUUID.test(params.productSegment[1])) {
    productId = params.productSegment[1];
    productSlug = params.productSegment[0];
    console.info(`Loading /product/${productSlug}/${productId}`);
    product = await getProductById(params.productSegment[1], client);

  } else if (params.productSegment.length === 1 && regexForUUID.test(params.productSegment[0])) {
    //Assume this is a legacy URL and product id is at slug 1
    console.warn(`Legacy URL detected ${params.productSegment[0]}, please update to use slug and id`);
    productId = params.productSegment[0];
    product = await getProductById(params.productSegment[0], client);

  } else if (params.productSegment.length === 1) {

    console.warn(`Using /product/${params.productSegment[0]} as slug`);
    productSlug = params.productSegment[0];
    const productResult = await client.ShopperCatalog.Products.With(["main_image"]).Filter({
      in: {
        slug: [params.productSegment[0]]
      }
    }).All();
    if (productResult?.data?.length > 0) {
      product = { data: productResult.data[0] };
      productId = product.data.id;

    }
  }
  return { productId, productSlug, product };
}

