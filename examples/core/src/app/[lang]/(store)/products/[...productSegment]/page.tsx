import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import {
  getByContextProduct,
  getStock,
  getAllFiles,
  ElasticPathFile,
  listLocations,
  getAllCurrencies,
  getByContextAllProducts,
  getByContextChildProducts,
} from "@epcc-sdk/sdks-shopper";
import { createElasticPathClient } from "src/lib/create-elastic-path-client";
import { SimpleProductContent } from "src/components/product/standard/SimpleProductContent";
import { SimpleProductProvider } from "src/components/product/standard/SimpleProductProvider";
import { VariationProductProvider } from "src/components/product/variations/VariationProductProvider";
import { VariationProductContent } from "src/components/product/variations/VariationProductContent";
import { BundleProductProvider } from "src/components/product/bundles/BundleProductProvider";
import { BundleProductContent } from "src/components/product/bundles/BundleProductContent";
import { getPreferredCurrency } from "src/lib/i18n";
import { TAGS } from "src/lib/constants";
import { getProductKeywords, getProductURLSegment } from "src/lib/product-helper";
import ProductSchema from "src/components/product/schema/ProductSchema";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ productSegment: string[]; lang?: string; }>;
};

const regexForUUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  const { productId, productSlug, product } = await getProduct(params);

  if (!product) {
    notFound();
  }

  const canonicalURL = getProductURLSegment({
    id: productId,
    attributes: { slug: productSlug },
  });

  return {
    title: product.data?.attributes?.name,
    description: product.data?.attributes?.description,
    keywords: getProductKeywords(product),
    alternates: {
      canonical: canonicalURL,
    },
  };
}

export default async function ProductPage(props: Props) {
  const params = await props.params;

  const client = createElasticPathClient();

  const { productId, productSlug, product: productResponse, currency } = await getProduct(params);

  const inventoryPromise = getStock({
    client,
    path: {
      product_uuid: productId || '',
    },
  });
  const locationPromise = listLocations({client})

  const [locationResponse, inventoryResponse] = await Promise.all([
    locationPromise,
    inventoryPromise,
  ]);

  let parentProduct = null;
  if (productResponse?.data?.relationships?.parent?.data?.id) {
    parentProduct = await getByContextProduct({
      client,
      path: {
        product_id: productResponse?.data?.relationships?.parent?.data?.id,
      },
      query: {
        include: ["main_image", "files", "component_products"],
      },
      headers: {
        "Accept-Language": params.lang,
        "X-Moltin-Currency": currency?.code
      },
    });
  }

  let variationProducts = null;
  const productType = productResponse?.data?.meta?.product_types?.[0]
  if (productType === "parent" || productType === "child") {
    const parentProductId = productResponse?.data?.relationships?.parent?.data?.id || productResponse?.data?.id;
    variationProducts = await getByContextChildProducts({
      client,
      path: {
        product_id: parentProductId || '',
      },
      query: {
        include: ["main_image", "files", "component_products"],
      },
      headers: {
        "Accept-Language": params.lang,
        "X-Moltin-Currency": currency?.code
      },
    });
  }

  if (!productResponse?.data) {
    notFound();
  }

  const componentProducts = productResponse.included?.component_products;
  let componentImageFiles = [] as ElasticPathFile[];
  if (componentProducts && componentProducts.length > 0) {
    const mainImageIds = componentProducts
      .map((c) => c.relationships?.main_image?.data?.id)
      .filter(isString);
    const fileResponse = await getAllFiles({
      client,
      query: {
        filter: `in(id,${mainImageIds.join(",")})`,
      },
    });
    componentImageFiles = fileResponse.data?.data ?? [];
  }

  let component = null;
  switch (productResponse.data?.meta?.product_types?.[0]) {
    case "standard":
      component = (
        <SimpleProductProvider
          product={productResponse}
          inventory={inventoryResponse.data?.data}
          locations={locationResponse.data?.data}
          currency={currency}
        >
          <ProductSchema product={productResponse} />
          <SimpleProductContent />
        </SimpleProductProvider>
      );
      break;
    case "bundle":
      component = (
        <BundleProductProvider
          product={productResponse}
          componentImageFiles={componentImageFiles}
          inventory={inventoryResponse.data?.data}
          locations={locationResponse.data?.data}
          currency={currency}
        >
          <ProductSchema product={productResponse} />
          <BundleProductContent />
        </BundleProductProvider>
      );
      break;
    case "child":
    case "parent":
      component = (
        <VariationProductProvider
          product={productResponse}
          parentProduct={parentProduct?.data}
          variationProducts={variationProducts?.data}
          inventory={inventoryResponse.data?.data}
          locations={locationResponse.data?.data}
          currency={currency}
        >
          <ProductSchema
            product={productResponse}
            parentProduct={parentProduct?.data}
            variationProducts={variationProducts?.data}
          />
          <VariationProductContent />
        </VariationProductProvider>
      );
      break;
    default:
      component = (
        <SimpleProductProvider
          product={productResponse}
          inventory={inventoryResponse.data?.data}
          locations={locationResponse.data?.data}
          currency={currency}
        >
          <ProductSchema product={productResponse} />
          <SimpleProductContent />
        </SimpleProductProvider>
      );
      break;
  }

  return (
    <div
      className="px-4 xl:px-0 py-8 mx-auto max-w-[48rem] md:py-20 lg:max-w-[80rem] w-full"
      key={"page_" + productId ? productId : productSlug}
    >
      {component}
    </div>
  );
}

function isString(x: any): x is string {
  return typeof x === "string";
}

async function getProduct(params: { productSegment: string[]; lang?: string; }) {
  const client = createElasticPathClient();
  const currencies = await getAllCurrencies({
    client,
    next: {
      tags: [TAGS.currencies],
    },
  });
  const currency = getPreferredCurrency(params?.lang, currencies.data?.data || []);

  let product, productId, productSlug;

  if (params.productSegment.length === 2 && regexForUUID.test(params.productSegment[1] || '')) {
    productId = params.productSegment[1] || '';
    productSlug = params.productSegment[0];
    const result = await getByContextProduct({
      client,
      path: {
        product_id: productId,
      },
      query: {
        include: ["main_image", "files", "component_products"],
      },
      headers: {
        "Accept-Language": params.lang,
        "X-Moltin-Currency": currency?.code
      }
    });
    product = result?.data;

  } else if (params.productSegment.length === 1 && regexForUUID.test(params.productSegment[0] || '')) {
    productId = params.productSegment[0] || '';
    const result = await getByContextProduct({
      client,
      path: {
        product_id: productId,
      },
      query: {
        include: ["main_image", "files", "component_products"],
      },
      headers: {
        "Accept-Language": params.lang,
        "X-Moltin-Currency": currency?.code
      }
    });
    product = result?.data;

  } else if (params.productSegment.length === 1) {
    productSlug = params.productSegment[0];
    const productResult = await getByContextAllProducts({
      client,
      query: {
        filter: `eq(slug,${params.productSegment[0] ?? ''})`,
        include: ["main_image", "files", "component_products"],
      },
      headers: {
        "Accept-Language": params.lang,
        "X-Moltin-Currency": currency?.code
      }
    });

    if (productResult?.data?.data && productResult.data.data.length > 0) {
      product = {
        data: productResult.data.data[0],
        included: productResult.data.included
      };
      productId = product?.data?.id;
    }
  }
  return { productId, productSlug, product, currency };
}
