import { NavigationNode } from "./build-site-navigation";
import { BreadcrumbLookup } from "./types/breadcrumb-lookup";

export function buildBreadcrumbLookup(
  nodes: NavigationNode[]
): BreadcrumbLookup {
  return nodes.reduce((acc, curr) => {
    const { href, name, children, slug } = curr;
    return {
      ...acc,
      [href]: {
        href,
        name,
        slug,
      },
      ...(children && buildBreadcrumbLookup(children)),
    };
  }, {});
}
