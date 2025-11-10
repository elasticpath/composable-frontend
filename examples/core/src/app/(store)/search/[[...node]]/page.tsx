import { Search } from "../search";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createElasticPathClient } from "../../../../lib/create-elastic-path-client";
import {
  Client,
  getByContextAllHierarchies,
  getByContextAllProducts,
  getByContextProductsForNode,
  getByContextHierarchyNodes,
  Hierarchy,
} from "@epcc-sdk/sdks-shopper";

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

export default async function SearchPage(props: {
  params: Promise<Params>;
  searchParams: Promise<SearchParams>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const client = createElasticPathClient();

  const { limit, offset } = searchParams;

  if (!params.node || params.node.length === 0) {
    const products = await getByContextAllProducts({
      client,
      query: {
        "page[limit]": BigInt(processLimit(limit)),
        "page[offset]": BigInt(processOffset(offset)),
        include: ["main_image"],
      },
    });
    return <Search page={products.data} />;
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
    const products = await getByContextProductsForNode({
      client,
      path: {
        node_id: rootHierarchy.id!,
      },
      query: {
        "page[limit]": BigInt(processLimit(limit)),
        "page[offset]": BigInt(processOffset(offset)),
        include: ["main_image"],
      },
    });

    return <Search page={products.data} />;
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

  return <Search page={products.data} />;
}

/**
 * Works to a maximum of 25 hierarchies (default limit).
 * Behavior for more than 25 hierarchies is unpredictable.
 */
async function findHierarchyFromSlug(
  client: Client,
  slug: string,
): Promise<Hierarchy | undefined> {
  const allHierarchies = await getByContextAllHierarchies({
    client,
    query: {
      "page[limit]": BigInt(100),
    },
  });

  return allHierarchies.data?.data?.find((hierarchy) => {
    return hierarchy.attributes?.slug === slug;
  });
}

/**
 * Works to a maximum of 25 Child Nodes (default limit).
 * Behavior for more than 25 Child Nodes is unpredictable.
 */
async function findLeafNodeId(
  client: Client,
  rootHierarchy: Hierarchy,
  leafNodeSlug: string,
): Promise<string | undefined> {
  const hierarchyChildrenResponse = await getByContextHierarchyNodes({
    client,
    path: {
      hierarchy_id: rootHierarchy.id!,
    },
  });

  const hierarchyChildren = hierarchyChildrenResponse.data;
  const hierarchyChild = hierarchyChildren?.data?.find((child) => {
    return child.attributes?.slug === leafNodeSlug;
  });

  return hierarchyChild?.id;
}

function getLastArrayElement<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

async function getNodeProducts(
  client: Client,
  nodeId: string,
  limit?: string,
  offset?: string,
) {
  return getByContextProductsForNode({
    client,
    path: {
      node_id: nodeId,
    },
    query: {
      "page[limit]": BigInt(processLimit(limit)),
      "page[offset]": BigInt(processOffset(offset)),
      include: ["main_image"],
    },
  });
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
