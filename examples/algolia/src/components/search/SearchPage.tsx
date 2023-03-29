import React from "react";
import { Box } from "@chakra-ui/react";
import SearchResults from "./SearchResults";
import {
  InstantSearch,
  InstantSearchSSRProvider,
} from "react-instantsearch-hooks-web";
import { searchClient } from "../../lib/search-client";
import { algoliaEnvData } from "../../lib/resolve-algolia-env";
import { ISearch } from "../../lib/search-props";
import { useNextRouterHandler } from "../../lib/use-next-router-handler";
import { resolveRouting } from "../../lib/algolia-search-routing";
import Breadcrumb from "../breadcrumb";
import { NextPageWithLayout } from "../../pages/_app";

export const Search: NextPageWithLayout<ISearch> = ({
  algoliaServerState,
  url,
  node,
  breadcrumbEntries,
  lookup,
}: ISearch) => {
  const { initialUiState, NextRouterHandler } = useNextRouterHandler(
    resolveRouting(url)
  );

  return (
    <Box px={4} py={8}>
      <InstantSearchSSRProvider {...algoliaServerState}>
        <InstantSearch
          searchClient={searchClient}
          indexName={algoliaEnvData.indexName}
          initialUiState={initialUiState}
          key={node.join("-")}
        >
          {/*
           *  The NextRouterHandler is a workaround for a current limitation in algolia instantsearch.js
           *  https://github.com/algolia/react-instantsearch/issues/3506#issuecomment-1213341651
           */}
          <NextRouterHandler />
          {/* Breadcrumb */}
          {breadcrumbEntries && (
            <Box maxW="7xl" mx="auto">
              <Breadcrumb entries={breadcrumbEntries} />
            </Box>
          )}
          <SearchResults
            lookup={lookup}
            NextRouterHandler={NextRouterHandler}
          />
        </InstantSearch>
      </InstantSearchSSRProvider>
    </Box>
  );
};

export default Search;
