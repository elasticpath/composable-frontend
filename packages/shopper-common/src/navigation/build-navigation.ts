import type { Client, Hierarchy } from "@epcc-sdk/sdks-shopper"
import { ISchema, NavigationNode } from "./navigation-types"
import {
  getByContextAllHierarchies,
  getByContextHierarchyChildNodes,
  getByContextHierarchyNodes,
} from "@epcc-sdk/sdks-shopper"

export async function buildSiteNavigation(
  client?: Client,
): Promise<NavigationNode[]> {
  // Fetch hierarchies to be used as top level nav
  const hierarchiesResponse = await getByContextAllHierarchies({
    client,
    body: undefined,
    query: {
      "page[limit]": 100,
      "page[offset]": 0,
    },
  })

  if (!hierarchiesResponse.response.ok) {
    throw new Error("Failed to fetch hierarchies")
  }

  const hierarchies = hierarchiesResponse.data?.data

  return hierarchies ? constructTree(hierarchies, client) : []
}

/**
 * Construct hierarchy tree, limited to 5 hierarchies at the top level
 */
function constructTree(
  hierarchies: Hierarchy[],
  client?: Client,
): Promise<NavigationNode[]> {
  const tree = hierarchies
    .slice(0, 4)
    .map((hierarchy) =>
      createNode({
        name: hierarchy.attributes?.name!,
        id: hierarchy.id!,
        slug: hierarchy.attributes?.slug,
      }),
    )
    .map(async (hierarchy) => {
      // Fetch first-level nav ('parent nodes') - the direct children of each hierarchy
      const directChildrenResponse = await getByContextHierarchyChildNodes({
        client,
        body: undefined,
        path: {
          hierarchy_id: hierarchy.id,
        },
        query: {
          "page[limit]": 100,
          "page[offset]": 0,
        },
      })

      if (!directChildrenResponse.response.ok) {
        throw new Error("Failed to fetch hierarchy children")
      }

      const directChildren = directChildrenResponse.data?.data ?? []

      // Fetch all nodes in each hierarchy (i.e. all 'child nodes' belonging to a hierarchy)
      const allNodesResponse = await getByContextHierarchyNodes({
        client,
        body: undefined,
        path: {
          hierarchy_id: hierarchy.id,
        },
        query: {
          "page[limit]": 100,
          "page[offset]": 0,
        },
      })

      if (!allNodesResponse.response.ok) {
        throw new Error("Failed to fetch hierarchy nodes")
      }

      const allNodes = allNodesResponse.data?.data ?? []

      // Build 2nd level by finding all 'child nodes' belonging to each first level featured-nodes
      const directs = directChildren?.slice(0, 4).map((child) => {
        const children: ISchema[] =
          allNodes
            ?.filter(
              (node) => node?.relationships?.parent?.data.id === child.id,
            )
            .map((node) =>
              createNode({
                name: node.attributes?.name!,
                id: node.id!,
                slug: node.attributes?.slug,
                hrefBase: `${hierarchy.href}/${child.attributes?.slug}`,
              }),
            ) ?? []

        return createNode({
          name: child.attributes?.name!,
          id: child.id!,
          slug: child.attributes?.slug,
          hrefBase: hierarchy.href,
          children,
        })
      })

      return { ...hierarchy, children: directs }
    })

  return Promise.all(tree)
}

interface CreateNodeDefinition {
  name: string
  id: string
  slug?: string
  hrefBase?: string
  children?: ISchema[]
}

function createNode({
  name,
  id,
  slug = "missing-slug",
  hrefBase = "",
  children = [],
}: CreateNodeDefinition): ISchema {
  return {
    name,
    id,
    slug,
    href: `${hrefBase}/${slug}`,
    children,
  }
}
