import React from "react";
import Link from "next/link";
import { Badge, Box, Divider, Grid, GridItem, Heading } from "@chakra-ui/react";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import type { ParsedUrlQuery } from "querystring";
import { getHierarchies, getNode, getNodes } from "../../services/hierarchy";
import {
  Configure,
  Hits,
  InstantSearch,
  InstantSearchServerState,
  InstantSearchSSRProvider,
  RefinementList,
} from "react-instantsearch-hooks-web";
import { SearchHit } from "../../components/search/SearchHit";
import Pagination from "../../components/search/Pagination";
import { history } from "instantsearch.js/es/lib/routers/index.js";
import algoliasearch from "algoliasearch/lite";
import { algoliaEnvData } from "../../lib/resolve-algolia-env";
import { Node } from "@moltin/sdk";
import { searchClient } from "../../lib/search-client";

interface CatagoryRouterQuery extends ParsedUrlQuery {
  nodeId: string;
}

interface ICatagory {
  category: Node;
  algoliaServerState?: InstantSearchServerState;
  url: string;
}

export const Category: NextPage<ICatagory> = ({
  category,
  algoliaServerState,
  url,
}) => {
  return (
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
        <Configure
          filters={`ep_category_page_id:\"${category.attributes.name}\"`}
        />
        <Hits />
        <Heading p="6">Category</Heading>
        {category ? (
          <>
            {/* <Grid templateColumns="repeat(5, 1fr)" gap={6} p="6">
            {hits?.map(({ objectID, ep_name, ep_sku, ep_slug }) => {
              return (
                <Link
                  href={`/products/${ep_slug}/${objectID}`}
                  key={objectID}
                  passHref
                >
                  <GridItem>
                    <Box
                      maxW="sm"
                      borderWidth="1px"
                      borderRadius="lg"
                      overflow="hidden"
                    >
                      <Box p="6">{ep_name}</Box>
                      <Divider />
                      <Box p="6">
                        <Box display="flex" alignItems="baseline">
                          <Badge borderRadius="full" px="2" colorScheme="teal">
                            live
                          </Badge>
                          <Box
                            color="gray.500"
                            fontWeight="semibold"
                            letterSpacing="wide"
                            fontSize="xs"
                            textTransform="uppercase"
                            ml="2"
                          >
                            {ep_sku}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </GridItem>
                </Link>
              );
            })}
          </Grid> */}
            <Box mb={6}>
              <Pagination />
            </Box>
          </>
        ) : null}
      </InstantSearch>
    </InstantSearchSSRProvider>
  );
};

export const getStaticPaths: GetStaticPaths<CatagoryRouterQuery> = async () => {
  const hierarchies = await getHierarchies();
  const nodesRequest = hierarchies.map(({ id }) => getNodes(id));
  const nodes = await Promise.all(nodesRequest);
  const paths = nodes.flat().map((node) => {
    return `/category/${node.id}`;
  });
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<
  ICatagory,
  CatagoryRouterQuery
> = async ({ params }) => {
  // Search the index and print the results

  if (!params) {
    return {
      notFound: true,
    };
  }

  const categoryRes = await getNode(params.nodeId);
  /*const serverState = await getServerState(
    <Category category={categoryRes.data} />
  );*/
  const response = await index.search<SearchHit>("", {
    filters: `ep_category_page_id:\"${categoryRes.data?.attributes.name}\"`,
    hitsPerPage: 2,
  });
  return {
    props: {
      category: categoryRes.data,
      hits: response.hits,
    },
  };

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

export default Category;
