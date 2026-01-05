import { Metadata } from "next";
import { notFound } from "next/navigation";
import React from "react";
import {
  getByContextProduct,
  getStock,
  getAllFiles,
  ElasticPathFile,
} from "@epcc-sdk/sdks-shopper";
import { createElasticPathClient } from "../../../../lib/create-elastic-path-client";
import { SimpleProductContent } from "../../../../components/product/standard/SimpleProductContent";
import { SimpleProductProvider } from "../../../../components/product/standard/SimpleProductProvider";
import { VariationProductProvider } from "../../../../components/product/variations/VariationProductProvider";
import { VariationProductContent } from "../../../../components/product/variations/VariationProductContent";
import { BundleProductProvider } from "../../../../components/product/bundles/BundleProductProvider";
import { BundleProductContent } from "../../../../components/product/bundles/BundleProductContent";
import { ProductRecommendations } from "src/components/product/ProductRecommendations";
import { cookies } from "next/headers";
import { CREDENTIALS_COOKIE_NAME } from "src/lib/cookie-constants";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ productId: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;

  const { productId } = params;

  const client = createElasticPathClient();
  const product = await getByContextProduct({
    client,
    path: {
      product_id: productId,
    },
    query: {
      include: ["main_image", "files", "component_products"],
    },
  });

  if (!product.data?.data) {
    notFound();
  }

  return {
    title: product.data.data.attributes?.name,
    description: product.data.data.attributes?.description,
  };
}

export default async function ProductPage(props: Props) {
  const params = await props.params;
  const client = createElasticPathClient();
  const productPromise = getByContextProduct({
    client,
    path: {
      product_id: params.productId,
    },
    query: {
      include: ["main_image", "files", "component_products"],
    },
  });
  const inventoryPromise = getStock({
    client,
    path: {
      product_uuid: params.productId,
    },
  });

  const [productResponse, inventoryResponse] = await Promise.all([
    productPromise,
    inventoryPromise,
  ]);

  let parentProduct = null;
  if (productResponse.data?.data?.relationships?.parent?.data?.id) {
    parentProduct = await getByContextProduct({
      client,
      path: {
        product_id: productResponse.data.data?.relationships?.parent?.data?.id,
      },
    });
  }

  if (!productResponse.data) {
    notFound();
  }

  const componentProducts = productResponse.data.included?.component_products;
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

  const cookieStore = await cookies();
  const credentialsCookie = cookieStore.get(CREDENTIALS_COOKIE_NAME);
  let accessToken: string | null = null;
  if (credentialsCookie?.value) {
    accessToken = JSON.parse(credentialsCookie.value).access_token;
  }
  
  const customLinks = productResponse?.data?.data?.relationships?.custom_relationships?.links;
  const similarRelationLink = customLinks
    ? (Object.values(customLinks) as string[]).find((link) => link.includes("similar"))
    : undefined;

  let similarProducts: any = null;
  if (similarRelationLink) {
    try {
      const url = new URL(
        `https://${process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL}${similarRelationLink}`
      );
      url.searchParams.set("include", "main_image,files,component_products");

      const res = await fetch(
        url,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (res.ok) {
        similarProducts = await res.json();
      } else {
        console.warn(`Failed to fetch similar products: ${res.status} ${res.statusText}`);
      }
    } catch (error) {
      console.warn("Error fetching similar products:", error);
    }
  }

  let component = null;
  switch (productResponse.data.data?.meta?.product_types?.[0]) {
    case "standard":
      component = (
        <SimpleProductProvider
          product={productResponse.data}
          inventory={inventoryResponse.data?.data}
        >
          <SimpleProductContent />
          {similarProducts?.data && (
            <ProductRecommendations
              similarProducts={similarProducts.data}
              included={similarProducts.included}
            />
          )}
        </SimpleProductProvider>
      );
      break;
    case "bundle":
      component = (
        <BundleProductProvider
          product={productResponse.data}
          componentImageFiles={componentImageFiles}
          inventory={inventoryResponse.data?.data}
        >
          <BundleProductContent />
          {similarProducts?.data && (
            <ProductRecommendations
              similarProducts={similarProducts.data}
              included={similarProducts.included}
            />
          )}
        </BundleProductProvider>
      );
      break;
    case "child":
    case "parent":
      component = (
        <VariationProductProvider
          product={productResponse.data}
          parentProduct={parentProduct?.data}
          inventory={inventoryResponse.data?.data}
        >
          <VariationProductContent />
          {similarProducts?.data && (
            <ProductRecommendations
              similarProducts={similarProducts.data}
              included={similarProducts.included}
            />
          )}
        </VariationProductProvider>
      );
      break;
    default:
      break;
  }

  return (
    <div
      className="px-4 xl:px-0 py-8 mx-auto max-w-[48rem] md:py-20 lg:max-w-[80rem] w-full"
      key={"page_" + params.productId}
    >
      {component}
    </div>
  );
}

function isString(x: any): x is string {
  return typeof x === "string";
}
