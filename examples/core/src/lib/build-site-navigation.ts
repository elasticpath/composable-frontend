import {
  Client,
  getByContextAllHierarchies,
  getByContextHierarchyChildNodes,
  getByContextHierarchyNodes,
  Hierarchy,
} from "@epcc-sdk/sdks-shopper";

interface ISchema {
  name: string;
  slug: string;
  href: string;
  id: string;
  children: ISchema[];
}

export interface NavigationNode {
  name: string;
  slug: string;
  href: string;
  id: string;
  children: NavigationNode[];
}

export async function buildSiteNavigation(
  client: Client,
): Promise<NavigationNode[]> {
  // Fetch hierarchies to be used as top level nav
  const hierarchiesResponse = await getByContextAllHierarchies({
    client,
  });
  if (!hierarchiesResponse.data?.data) {
    return [];
  }

  return constructTree(hierarchiesResponse.data.data, client);
}

/**
 * Construct hierarchy tree, limited to 5 hierarchies at the top level
 */
function constructTree(
  hierarchies: Hierarchy[],
  client: Client,
): Promise<NavigationNode[]> {
  const tree = hierarchies
    .slice(0, 4)
    .map((hierarchy) =>
      createNode({
        name: hierarchy.attributes?.name!,
        id: hierarchy.id!,
        slug: hierarchy.attributes?.slug,
        parentName: "",
      }),
    )
    .map(async (hierarchy) => {
      // Fetch first-level nav ('parent nodes') - the direct children of each hierarchy
      const directChildren = await getByContextHierarchyChildNodes({
        client,
        path: {
          hierarchy_id: hierarchy.id,
        },
      });

      // Fetch all nodes in each hierarchy (i.e. all 'child nodes' belonging to a hierarchy)
      const allNodes = await getByContextHierarchyNodes({
        client,
        path: {
          hierarchy_id: hierarchy.id,
        },
      });

      // Build 2nd level by finding all 'child nodes' belonging to each first level featured-nodes
      const directs = directChildren.data?.data
        ? directChildren.data.data.slice(0, 4).map((child) => {
          const children: ISchema[] = allNodes.data?.data
            ? allNodes.data.data
              .filter(
                (node) => node?.relationships?.parent?.data.id === child.id,
              )
              .map((node) =>
                createNode({
                  name: node.attributes?.name!,
                  id: node.id!,
                  slug: node.attributes?.slug,
                  parentName: `${hierarchy.name} > ${child.attributes?.name}`,
                }),
              )
            : [];

          return createNode({
            name: child.attributes?.name!,
            id: child.id!,
            slug: child.attributes?.slug,
            parentName: hierarchy.name,
            children,
          });
        })
        : [];

      return { ...hierarchy, children: directs };
    });

  return Promise.all(tree);
}

interface CreateNodeDefinition {
  name: string;
  id: string;
  slug?: string;
  hrefBase?: string;
  children?: ISchema[];
}

function createNode({
  name,
  id,
  slug = "missing-slug",
  hrefBase = "",
  children = [],
  parentName = "",
}: CreateNodeDefinition & { parentName?: string }): ISchema {
  const hierarchicalPath = parentName
    ? `${parentName} > ${name}`
    : name;
  const segments = hierarchicalPath.split(" > ").filter(Boolean);
  const urlPath = segments.length > 0
    ? "/" + segments.map(segment => encodeURIComponent(segment)).join("/")
    : "";

  return {
    name,
    id,
    slug,
    href: `${hrefBase}/${urlPath}`,
    children,
  };
}
