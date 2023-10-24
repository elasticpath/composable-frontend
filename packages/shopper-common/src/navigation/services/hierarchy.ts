import type { Node, Hierarchy } from "@moltin/sdk"
import { Moltin as EPCCClient } from "@moltin/sdk"

export async function getHierarchies(client: EPCCClient): Promise<Hierarchy[]> {
  const result = await client.ShopperCatalog.Hierarchies.All()
  return result.data
}

export async function getHierarchyChildren(
  hierarchyId: string,
  client: EPCCClient,
): Promise<Node[]> {
  const result = await client.ShopperCatalog.Hierarchies.GetHierarchyChildren({
    hierarchyId,
  })
  return result.data
}

export async function getHierarchyNodes(
  hierarchyId: string,
  client: EPCCClient,
): Promise<Node[]> {
  const result = await client.ShopperCatalog.Hierarchies.GetHierarchyNodes({
    hierarchyId,
  })

  return result.data
}
