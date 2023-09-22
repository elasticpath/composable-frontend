import { GetStaticPropsContext, GetStaticPropsResult } from "next";
import type { ParsedUrlQuery } from "querystring";
import { buildSiteNavigation, NavigationNode } from "./build-site-navigation";
import { StoreContextSSG } from "@elasticpath/react-shopper-hooks";
import {isEPError, isNoDefaultCatalogError} from "./epcc-errors";

type IncomingPageStaticProp<P, Q extends ParsedUrlQuery = ParsedUrlQuery> = (
  ctx: GetStaticPropsContext<Q>,
  nav: NavigationNode[]
) => Promise<GetStaticPropsResult<P>>;

interface ExpandedContext {
  store: StoreContextSSG;
}

export function withStoreStaticProps<
  T extends object = {},
  P extends ParsedUrlQuery = ParsedUrlQuery
>(incomingGSP?: IncomingPageStaticProp<T, P>) {
  return async (
    ctx: GetStaticPropsContext<P>
  ): Promise<GetStaticPropsResult<T & ExpandedContext>> => {
    // Fetching nodes and hierarchies for statically generated nav
    try {
      const nav = await buildSiteNavigation();

      const incomingGSPResult = incomingGSP
        ? await incomingGSP(ctx, nav)
        : { props: {} as T };

      if ("props" in incomingGSPResult) {
        return {
          props: {
            ...incomingGSPResult.props,
            store: {
              type: "store-context-ssg",
              nav,
            },
          },
        };
      }

      if ("redirect" in incomingGSPResult) {
        return { redirect: { ...incomingGSPResult.redirect } };
      }

      if ("notFound" in incomingGSPResult) {
        return { notFound: incomingGSPResult.notFound };
      }

      // Fallback
      return {
        notFound: true,
      };
    } catch (err) {

      if (isEPError(err) && isNoDefaultCatalogError(err.errors)) {
        console.error("\x1b[31m%s\x1b[0m", "Error: Catalog Not Published");
        console.error("Please publish a catalog for this store.")
        console.error("See https://elasticpath.dev/docs/pxm/products/get-started-pxm#create-and-publish-a-catalog")
      } else {
        console.error(
            `${
                err instanceof Error
                    ? `${err.name} - ${err.message}`
                    : "Unknown error occurred while trying to resolve store wrapper."
            }`
        );
      }
      return {
        notFound: true,
      };
    }
  };
}
