import { GetStaticPropsContext, GetStaticPropsResult } from "next";
import type { ParsedUrlQuery } from "querystring";
import { buildSiteNavigation, NavigationNode } from "./build-site-navigation";
import { StoreContextSSG } from "@elasticpath/react-shopper-hooks";

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
  };
}
