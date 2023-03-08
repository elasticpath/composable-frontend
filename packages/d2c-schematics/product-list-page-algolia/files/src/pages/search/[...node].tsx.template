import { withStoreServerSideProps } from "../../lib/store-wrapper-ssr";

import {
  getSearchSSRProps,
  ISearch,
  SearchQuery,
} from "../../lib/search-props";
import Search from "../../components/search/SearchPage";
import { buildBreadcrumbLookup } from "../../lib/build-breadcrumb-lookup";
import React, { ReactElement } from "react";
import Head from "next/head";
import { StoreContext } from "@elasticpath/react-shopper-hooks";
import MainLayout, {
  MAIN_LAYOUT_TITLE,
} from "../../components/layouts/MainLayout";

interface INodeSearch extends ISearch {
  nodeName?: string | string[];
}

export function NodeSearch(props: INodeSearch): JSX.Element {
  return <Search {...props} />;
}

NodeSearch.getLayout = function getLayout(
  page: ReactElement,
  pageProps: { node: string[] },
  ctx?: StoreContext
) {
  return (
    <>
      <MainLayout nav={ctx?.nav ?? []}>{page}</MainLayout>
      <Head>
        <title>
          {MAIN_LAYOUT_TITLE} - {pageProps.node[pageProps.node.length - 1]}
        </title>
        <meta name="description" content={pageProps.node.join("/")} />
        <meta
          property="og:title"
          content={`${MAIN_LAYOUT_TITLE} - ${
            pageProps.node[pageProps.node.length - 1]
          }`}
        />
        <meta property="og:description" content={pageProps.node.join("/")} />
      </Head>
    </>
  );
};

export const getServerSideProps = withStoreServerSideProps<
  ISearch,
  SearchQuery
>(async (context, nav) => {
  return getSearchSSRProps(NodeSearch, buildBreadcrumbLookup(nav))(context);
});

export default NodeSearch;
