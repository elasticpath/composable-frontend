import type { GetServerSideProps } from "next";
import type { NextPage } from "next";
import type { ParsedUrlQuery } from "querystring";
import type { InstantSearchServerState } from "react-instantsearch-hooks-web";

import { getServerState } from "react-instantsearch-hooks-server";
import React from "react";
import { BreadcrumbEntry, createBreadcrumb } from "./create-breadcrumb";
import { BreadcrumbLookup } from "./types/breadcrumb-lookup";
import { renderToString } from "react-dom/server";

export interface SearchQuery extends ParsedUrlQuery {
  nodeId: string;
}

export interface ISearch {
  algoliaServerState?: InstantSearchServerState;
  url: string;
  node: string[];
  breadcrumbEntries: BreadcrumbEntry[];
  lookup: BreadcrumbLookup;
}

export const getSearchSSRProps =
  (
    SearchComponent: NextPage<ISearch>,
    lookup: BreadcrumbLookup
  ): GetServerSideProps<ISearch, SearchQuery> =>
  async ({ req, params }) => {
    const protocol = req.headers.referer?.split("://")[0] || "https";
    const url = `${protocol}://${req.headers.host}${req.url}`;
    const node = (params?.node as string[]) ?? [];
    const breadcrumbEntries = createBreadcrumb(node, lookup);

    const algoliaServerState = await getServerState(
      <SearchComponent
        url={url}
        node={node}
        breadcrumbEntries={breadcrumbEntries}
        lookup={lookup}
      />,
      { renderToString }
    );

    return {
      props: {
        algoliaServerState,
        url,
        node,
        breadcrumbEntries,
        lookup,
      },
    };
  };
