import { Search } from "../search";
import { Metadata } from "next";
import { getServerSideImplicitClient } from "../../../../lib/epcc-server-side-implicit-client";
import {
  Hierarchy,
  ElasticPath,
  ProductResponse,
  ShopperCatalogResourcePage,
} from "@elasticpath/js-sdk";
import { notFound } from "next/navigation";
import { ShopperProduct } from "@elasticpath/react-shopper-hooks";
import {
  getMainImageForProductResponse,
  getOtherImagesForProductResponse,
} from "../../../../lib/file-lookup";

export const metadata: Metadata = {
  title: "Search",
  description: "Search for products",
};

export const dynamic = "force-dynamic";

type Params = {
  node?: string[];
};

type SearchParams = {
  limit?: string;
  offset?: string;
};

export default async function SearchPage({
  searchParams,
  params,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const client = getServerSideImplicitClient();

  const { limit, offset } = searchParams;

  if (!params.node || params.node.length === 0) {
    const products = await client.ShopperCatalog.Products.With(["main_image"])
      .Limit(processLimit(limit))
      .Offset(processOffset(offset))
      .All();
    return <Search page={processResult(products)} />;
  }

  const rootNodeSlug = params.node?.[0];

  if (!rootNodeSlug) {
    return <Search />;
  }

  const rootHierarchy = await findHierarchyFromSlug(client, rootNodeSlug);

  if (!rootHierarchy) {
    console.warn("No root hierarchy found for slug: ", rootNodeSlug);
    return notFound();
  }

  if (params.node.length === 1) {
    const products = await getNodeProducts(
      client,
      rootHierarchy.id,
      limit,
      offset,
    );

    return <Search page={processResult(products)} />;
  }

  const lastNodeSlug = getLastArrayElement(params.node);

  if (!lastNodeSlug) {
    console.warn("No last node slug found for node path: ", params.node);
    return notFound();
  }

  const leafNodeId = await findLeafNodeId(client, rootHierarchy, lastNodeSlug);

  if (!leafNodeId) {
    console.warn("No leaf node id found for slug: ", lastNodeSlug);
    return notFound();
  }

  const products = await getNodeProducts(client, leafNodeId, limit, offset);

  return <Search page={processResult(products)} />;
}

/**
 * Works to a maximum of 25 hierarchies (default limit).
 * Behavior for more than 25 hierarchies is unpredictable.
 */
async function findHierarchyFromSlug(
  client: ElasticPath,
  slug: string,
): Promise<Hierarchy | undefined> {
  const allHierarchies = await client.ShopperCatalog.Hierarchies.All();

  return allHierarchies.data.find((hierarchy) => {
    return hierarchy.attributes.slug === slug;
  });
}

function processResult(
  page: ShopperCatalogResourcePage<ProductResponse>,
): ShopperCatalogResourcePage<ShopperProduct> {
  const processedData: ShopperProduct[] = page.data.map((product) => {
    const mainImage = page.included?.main_images
      ? getMainImageForProductResponse(product, page.included.main_images) ??
        null
      : null;

    const otherImages = page.included?.files
      ? getOtherImagesForProductResponse(product, page.included?.files) ?? []
      : [];

    return {
      kind: "simple-product",
      response: product,
      main_image: mainImage,
      otherImages: otherImages,
    };
  });

  return {
    ...page,
    data: processedData,
  };
}

/**
 * Works to a maximum of 25 Child Nodes (default limit).
 * Behavior for more than 25 Child Nodes is unpredictable.
 */
async function findLeafNodeId(
  client: ElasticPath,
  rootHierarchy: Hierarchy,
  leafNodeSlug: string,
): Promise<string | undefined> {
  const hierarchyChildrenResponse =
    await client.ShopperCatalog.Hierarchies.GetHierarchyNodes({
      hierarchyId: rootHierarchy.id,
    });

  const hierarchyChildren = hierarchyChildrenResponse.data;
  const hierarchyChild = hierarchyChildren.find((child) => {
    return child.attributes.slug === leafNodeSlug;
  });

  return hierarchyChild?.id;
}

function getLastArrayElement<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

async function getNodeProducts(
  client: ElasticPath,
  nodeId: string,
  limit?: string,
  offset?: string,
): Promise<ShopperCatalogResourcePage<ProductResponse>> {
  return client.ShopperCatalog.Nodes.With(["main_image"])
    .Offset(processOffset(offset))
    .Limit(processLimit(limit))
    .GetNodeProducts({ nodeId });
}

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 25;

function processOffset(offset: string | undefined): number {
  const offsetNumber = Number(offset);
  return isNaN(offsetNumber) ? DEFAULT_OFFSET : offsetNumber;
}

function processLimit(limit: string | undefined): number {
  const limitNumber = Number(limit);
  return isNaN(limitNumber) ? DEFAULT_LIMIT : limitNumber;
}
