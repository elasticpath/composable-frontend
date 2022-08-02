import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";
import type { GetServerSideProps, NextPage } from "next";
import SearchResults from "../components/search/SearchResults";
import type { ParsedUrlQuery } from "querystring";
import {
  InstantSearch,
  InstantSearchServerState,
  InstantSearchSSRProvider,
  RefinementList,
} from "react-instantsearch-hooks-web";
import { searchClient } from "../lib/search-client";
import { algoliaEnvData } from "../lib/resolve-algolia-env";
import { history } from "instantsearch.js/es/lib/routers/index.js";
import { getServerState } from "react-instantsearch-hooks-server";

interface SearchQuery extends ParsedUrlQuery {
  nodeId: string;
}

interface ISearch {
  algoliaServerState?: InstantSearchServerState;
  url: string;
}

export const Search: NextPage<ISearch, SearchQuery> = ({
  algoliaServerState,
  url,
}) => {
  return (
    <Box px={24} py={8}>
      <Text>Search results for</Text>
      <Heading>&quot;{"temp"}&quot;</Heading>
      <InstantSearchSSRProvider {...algoliaServerState}>
        <InstantSearch
          searchClient={searchClient}
          indexName={algoliaEnvData.indexName}
          routing={{
            router: history({
              // @ts-ignore TODO
              getLocation: () =>
                typeof window === "undefined" ? new URL(url) : window.location,
            }),
          }}
        >
          <SearchResults />
        </InstantSearch>
      </InstantSearchSSRProvider>
    </Box>
  );
};

export const getServerSideProps: GetServerSideProps<
  ISearch,
  SearchQuery
> = async ({ req, res }) => {
  // SSR Caching
  // https://github.com/vercel/next.js/tree/canary/examples/ssr-caching
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=10, stale-while-revalidate=59"
  );

  const protocol = req.headers.referer?.split("://")[0] || "https";
  const url = `${protocol}://${req.headers.host}${req.url}`;
  const algoliaServerState = await getServerState(<Search url={url} />);

  return {
    props: {
      algoliaServerState,
      url,
    },
  };
};

export default Search;
