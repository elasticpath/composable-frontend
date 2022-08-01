import { Badge, Box, Divider, Grid, GridItem, Heading } from "@chakra-ui/react";
import type { NextPage } from "next";
import Link from "next/link";
import { Configure, useHits } from "react-instantsearch-hooks-web";
import { SearchHit } from "../../components/search/SearchHit";
import React from "react";
import Pagination from "../../components/search/Pagination";

export const Products: NextPage<{}> = () => {
  const { hits } = useHits<SearchHit>();

  return (
    <div>
      <Heading p="6">All Products</Heading>
      <Configure filters={`is_child:0`} />
      <Grid templateColumns="repeat(5, 1fr)" gap={6} p="6">
        {hits.map(({ objectID, ep_name, ep_sku, ep_slug }) => {
          return (
            <Link
              key={objectID}
              href={`/products/${ep_slug}/${objectID}`}
              passHref
            >
              <GridItem cursor="pointer">
                <Box
                  key={objectID}
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
      </Grid>
      <Box mb={6}>
        <Pagination />
      </Box>
    </div>
  );
};

export default Products;
