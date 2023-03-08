import { algoliaEnvData } from "./resolve-algolia-env";
import { RouterParams } from "./types/search-query-params";
import { NextRouterHandlerProps } from "./use-next-router-handler";
import { EP_CURRENCY_CODE } from "../lib/resolve-ep-currency-code";

const EP_ROUTE_CATEGORY = "ep_slug_categories.lvl0";
const EP_ROUTE_BRAND = "ep_extensions_products_specifications.brand";
const EP_ROUTE_ON_SALE = "ep_extensions_products_specifications.on-sale";
const EP_ROUTE_PRICE = `ep_price.${EP_CURRENCY_CODE}.float_price`;
const EP_ROUTE_COLOR = "ep_extensions_products_specifications.color";

export function resolveRouting(
  url: string
): NextRouterHandlerProps<RouterParams> & { url: string } {
  return {
    dynamicRouteQuery: {},
    url,
    routeToState(routeState) {
      //  stateNode set to default to node for initial direct navigation render
      const {
        query,
        page,
        node: stateNode,
        sortBy,
        range = "",
        brand,
        onSale,
        color,
      } = routeState;
      return {
        [algoliaEnvData.indexName]: {
          query: query,
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
      };
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
        query,
        page,
        sortBy,
        node: hierarchicalMenu?.[EP_ROUTE_CATEGORY],
        range: range?.[EP_ROUTE_PRICE],
        brand: refinementList?.[EP_ROUTE_BRAND],
        color: refinementList?.[EP_ROUTE_COLOR],
        onSale: toggle?.[EP_ROUTE_ON_SALE],
      };
    },
  };
}
