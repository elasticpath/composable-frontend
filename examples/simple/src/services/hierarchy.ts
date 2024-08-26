import type { client as elasticPathClient } from "@epcc-sdk/sdks-shopper";
import {
  getByContextAllHierarchies,
  getByContextHierarchyChildNodes,
  getByContextHierarchyNodes,
} from "@epcc-sdk/sdks-shopper";

export async function getHierarchies(client?: typeof elasticPathClient) {
  return await getByContextAllHierarchies({
    client,
    query: {
      "page[limit]": 100,
      "page[offset]": 0,
    },
  });
}

export async function getHierarchyChildren(
  hierarchyId: string,
  client?: typeof elasticPathClient,
) {
  return await getByContextHierarchyChildNodes({
    client,
    path: {
      hierarchy_id: hierarchyId,
    },
    query: {
      "page[limit]": 100,
      "page[offset]": 0,
    },
  });
}

export async function getHierarchyNodes(
  hierarchyId: string,
  client?: typeof elasticPathClient,
) {
  return await getByContextHierarchyNodes({
    client,
    path: {
      hierarchy_id: hierarchyId,
    },
    query: {
      "page[limit]": 100,
      "page[offset]": 0,
    },
  });
}
