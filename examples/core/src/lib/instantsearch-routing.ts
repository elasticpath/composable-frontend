import type { UiState } from "instantsearch.js";
import { InstantSearchNextRouting } from "react-instantsearch-nextjs";

export const INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES = [
  "meta.search.categories.lvl0",
  "meta.search.categories.lvl1",
  "meta.search.categories.lvl2",
  "meta.search.categories.lvl3",
  "meta.search.categories.lvl4",
]
export const INDEX_NAME = "search"

// Cache to track recent valid nodes to distinguish temporary transitions from intentional clears
let lastValidNode: { node: string[]; timestamp: number } | null = null;
const PRESERVE_WINDOW_MS = 100; // Only preserve path for 100ms after last valid node

export type RouterParams = {
  q?: string;
  page?: number;
  node?: string[];
  sortBy?: string;
  range?: string;
};

export function resolveInstantSearchRouting<
  TUiState extends UiState = UiState,
>(
  lang?: string,
  currencyCode?: string
): InstantSearchNextRouting<TUiState, RouterParams> {
  const HIERARCHICAL_ATTRIBUTE = INSTANT_SEARCH_HIERARCHICAL_ATTRIBUTES[0];

  return {
    router: {
      cleanUrlOnDispose: false,

      createURL: ({ qsModule, routeState, location }) => {
        const { protocol, hostname, port = "", pathname, hash } = location;
        const basePath = lang ? `/${lang}` : "";
        const pathWithoutLang = basePath
          ? pathname.slice(basePath.length)
          : pathname;
        const match = pathWithoutLang.match(/^\/search(?:\/(.+))?$/);
        if (!match) {
          return location.href;
        }
        
        const { node, ...otherRouteState } = routeState;
        const currentUrlParams = urlToParams(location.toString());
        const currentLocationNode = match && match[1]
          ? match[1].split("/").filter(Boolean).map(decodeURIComponent)
          : undefined;
        
        const nodeIsChanging = JSON.stringify(node) !== JSON.stringify(currentLocationNode);
        if (currentUrlParams.q && !otherRouteState.q && nodeIsChanging) {
          otherRouteState.q = currentUrlParams.q as string;
        }
        if (currentUrlParams.range && !otherRouteState.range && nodeIsChanging) {
          otherRouteState.range = currentUrlParams.range as string;
        }
      
        let finalNode = node;

        const currentPathNodes = match && match[1]
          ? match[1].split("/").filter(Boolean).map(decodeURIComponent)
          : undefined;

        if (finalNode && finalNode.length > 0) {
          lastValidNode = { node: finalNode, timestamp: Date.now() };
        } else {
          if (
            lastValidNode &&
            currentPathNodes &&
            JSON.stringify(lastValidNode.node) === JSON.stringify(currentPathNodes) &&
            Date.now() - lastValidNode.timestamp < PRESERVE_WINDOW_MS
          ) {
            finalNode = currentPathNodes;
          }
        }
        
        const queryString = qsModule.stringify(removeUndefinedParams(otherRouteState));
        const portWithPrefix = port ? `:${port}` : "";
      
        const searchPath =
          finalNode && finalNode.length > 0
            ? `/search/${finalNode.map(encodeURIComponent).join("/")}`
            : `/search`;
        const outputPathname = basePath ? `${basePath}${searchPath}` : searchPath;
      
        if (!queryString) {
          return `${protocol}//${hostname}${portWithPrefix}${outputPathname}${hash}`;
        }
        return `${protocol}//${hostname}${portWithPrefix}${outputPathname}?${queryString}${hash}`;
      },

      parseURL: ({ location }) => {
        const params = urlToParams(location.toString());
        const basePath = lang ? `/${lang}` : "";
        const pathWithoutLang = basePath
          ? location.pathname.slice(basePath.length)
          : location.pathname;
        const match = pathWithoutLang.match(/^\/search(?:\/(.+))?$/);

        let nodePath: string[] | undefined;
        if (match && match[1]) {
          nodePath = match[1].split("/").filter(Boolean).map(decodeURIComponent);
        }

        return {
          ...params,
          ...(nodePath && nodePath.length > 0 ? { node: nodePath } : {}),
        };
      },
    },

    stateMapping: {
      routeToState(routeState) {
        const { q, page, node, sortBy, range } = routeState;

        const baseState: any = {
          [INDEX_NAME]: {
            query: q,
            page,
            ...(sortBy && { sortBy }),
          },
        };

        if (node && node.length > 0) {
          baseState[INDEX_NAME].hierarchicalMenu = {
            [HIERARCHICAL_ATTRIBUTE as string]: node,
          };
        }

        if (typeof range === "string") {
          const [minStr, maxStr] = range.split("-");
          const internalRangeString = `${minStr ?? ""}:${maxStr ?? ""}`;
          baseState[INDEX_NAME].range = {
            [`price.${currencyCode}.float_price`]: internalRangeString,
          };
        }

        return baseState as unknown as TUiState;
      },

      stateToRoute(uiState) {
        const indexUiState = uiState[INDEX_NAME] || {};
        const { query, page, hierarchicalMenu, sortBy, range } = indexUiState;

        let node: string[] | undefined;
        const hierarchicalValue = hierarchicalMenu?.[HIERARCHICAL_ATTRIBUTE as string];
        if (Array.isArray(hierarchicalValue)) {
          node = hierarchicalValue.length ? hierarchicalValue : undefined;
        }

        let rangeParam: string | undefined;
        if (range && typeof range === "object") {
          const entries = Object.entries(range);
          if (entries.length > 0) {
            const [, rawRangeValue] = entries[0] as [string, string];

            if (typeof rawRangeValue === "string") {
              const [minStr, maxStr] = rawRangeValue.split(":");

              const minPart = minStr ?? "";
              const maxPart = maxStr ?? "";

              if (minPart !== "" || maxPart !== "") {
                rangeParam = `${minPart}-${maxPart}`;
              }
            }
          }
        }

        return {
          q: query,
          page,
          sortBy,
          node,
          ...(rangeParam ? { range: rangeParam } : {}),
        };
      },
    },
  };
}

function urlToParams(url: string): Record<string, string | string[]> {
  return Array.from(new URL(url).searchParams.entries()).reduce<{
    [key: string]: string | string[];
  }>((acc, [key, value]) => {
    const valueAtKey: string | string[] | undefined = acc[key];
    return {
      ...acc,
      [key]: valueAtKey
        ? Array.isArray(valueAtKey)
          ? [...valueAtKey, value]
          : [valueAtKey, value]
        : value,
    };
  }, {});
}

function removeUndefinedParams(
  params: RouterParams,
): Record<string, string | string[]> {
  return Object.entries(params).reduce((queries, [key, value]) => {
    if (
      typeof value !== "undefined" ||
      (typeof value === "string" && value === "")
    ) {
      return { ...queries, [key]: value };
    }
    return queries;
  }, {});
}
