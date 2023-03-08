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
import MainLayout, {
  MAIN_LAYOUT_TITLE,
} from "../../components/layouts/MainLayout";

Search.getLayout = function getLayout(page: ReactElement, _, ctx) {
  return (
    <>
      <MainLayout nav={ctx?.nav ?? []}>{page}</MainLayout>
      <Head>
        <title>{MAIN_LAYOUT_TITLE} - Search</title>
        <meta name="description" content="Search for products" />
        <meta property="og:title" content={`${MAIN_LAYOUT_TITLE} - Search`} />
        <meta property="og:description" content="Search for products" />
      </Head>
    </>
  );
};

export const getServerSideProps = withStoreServerSideProps<
  ISearch,
  SearchQuery
>(async (context, nav) => {
  return getSearchSSRProps(Search, buildBreadcrumbLookup(nav))(context);
});

export default Search;
