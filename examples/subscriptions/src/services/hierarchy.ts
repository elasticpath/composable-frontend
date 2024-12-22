import type { Node, Hierarchy } from "@elasticpath/js-sdk";
import {ElasticPath } from "@elasticpath/js-sdk";

export async function getHierarchies(client: ElasticPath): Promise<Hierarchy[]> {
  const result = await client.ShopperCatalog.Hierarchies.All();
  return result.data;
}

export async function getHierarchyChildren(
  hierarchyId: string,
  client: ElasticPath,
): Promise<Node[]> {
  const result = await client.ShopperCatalog.Hierarchies.GetHierarchyChildren({
    hierarchyId,
  });
  return result.data;
}

export async function getHierarchyNodes(
  hierarchyId: string,
  client: ElasticPath,
): Promise<Node[]> {
  const result = await client.ShopperCatalog.Hierarchies.GetHierarchyNodes({
    hierarchyId,
  });

  return result.data;
}
