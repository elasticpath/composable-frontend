import { algoliaEnvData } from "./resolve-algolia-env";
import { RouterParams } from "./types/search-query-params";
import { EP_CURRENCY_CODE } from "./resolve-ep-currency-code";
import type { UiState } from "instantsearch.js";
import { InstantSearchNextRouting } from "react-instantsearch-nextjs";

const EP_ROUTE_CATEGORY = "ep_slug_categories.lvl0";
const EP_ROUTE_BRAND = "ep_extensions_products_specifications.brand";
const EP_ROUTE_ON_SALE = "ep_extensions_products_specifications.on-sale";
const EP_ROUTE_PRICE = `ep_price.${EP_CURRENCY_CODE}.float_price`;
const EP_ROUTE_COLOR = "ep_extensions_products_specifications.color";

export function resolveAlgoliaRouting<
  TUiState extends UiState = UiState,
>(): InstantSearchNextRouting<TUiState, RouterParams> {
  return {
    router: {
      createURL: ({ qsModule, routeState, location }) => {
        const { protocol, hostname, port = "", pathname, hash } = location;

        const { node, ...otherRouteState } = routeState;

        const queryString = qsModule.stringify({
          ...removeUndefinedParams(otherRouteState),
        });
        const portWithPrefix = port === "" ? "" : `:${port}`;

        let outputPathname = pathname;
        if (pathname.startsWith("/search")) {
          outputPathname = node ? `/search/${node.join("/")}` : "/search";
        }

        if (!queryString) {
          return `${protocol}//${hostname}${portWithPrefix}${outputPathname}${hash}`;
        }

        return `${protocol}//${hostname}${portWithPrefix}${outputPathname}?${queryString}${hash}`;
      },
      parseURL: ({ location }) => {
        const params = urlToParams(location.toString());

        let nodePath;
        if (location.pathname !== "/search") {
          nodePath = location.pathname.replace("/search/", "")?.split("/");
        }

        return {
          ...params,
          ...(nodePath ? { node: nodePath } : {}),
        };
      },
    },
    stateMapping: {
      routeToState(routeState) {
        //  stateNode set to default to node for initial direct navigation render
        const {
          q,
          page,
          node: stateNode,
          sortBy,
          range,
          brand,
          onSale,
          color,
        } = routeState;
        return {
          [algoliaEnvData.indexName]: {
            query: q,
            page: page,
            hierarchicalMenu: stateNode && {
              [EP_ROUTE_CATEGORY]: Array.isArray(stateNode)
                ? stateNode
                : [stateNode],
            },
            sortBy: sortBy,
            range: {
              [EP_ROUTE_PRICE]: range,
            },
            refinementList: {
              ...(brand && {
                [EP_ROUTE_BRAND]: Array.isArray(brand) ? brand : [brand],
              }),
              ...(color && {
                [EP_ROUTE_COLOR]: Array.isArray(color) ? color : [color],
              }),
            },
            ...(onSale !== undefined && {
              toggle: {
                [EP_ROUTE_ON_SALE]: onSale,
              },
            }),
          },
        } as TUiState;
      },
      stateToRoute(uiState) {
        const indexUiState = uiState[algoliaEnvData.indexName] || {};
        const {
          query,
          page,
          hierarchicalMenu,
          sortBy,
          range,
          refinementList,
          toggle,
        } = indexUiState;

        return {
          q: query,
          page,
          sortBy,
          node: hierarchicalMenu?.[EP_ROUTE_CATEGORY],
          range: range?.[EP_ROUTE_PRICE],
          brand: refinementList?.[EP_ROUTE_BRAND],
          color: refinementList?.[EP_ROUTE_COLOR],
          onSale: toggle?.[EP_ROUTE_ON_SALE],
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
