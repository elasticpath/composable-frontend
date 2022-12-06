import type { NextPage } from "next";
import { chakra, Grid, GridItem } from "@chakra-ui/react";

import type { Node, Promotion } from "@moltin/sdk";
import { ProductResponseWithImage } from "../lib/types/product-types";





import { withStoreStaticProps } from "../lib/store-wrapper-ssg";

const nodeId = process.env.NEXT_PUBLIC_DEMO_NODE_ID || "";
const promotionId = process.env.NEXT_PUBLIC_DEMO_PROMO_ID || "";

export interface IHome {
  
  
  featuredNodes?: Node[];
}

const Home: NextPage<IHome> = ({
  
  
}) => {
  return (
    <chakra.main>
    
      <Grid gap="12" padding={{ base: "2rem", md: "4rem" }}>
      
      </Grid>
    </chakra.main>
  );
};

export const getStaticProps = withStoreStaticProps<IHome>(async () => {
  // Fetching static data for the home page
  
  
  return {
    props: {
      
      
    },
  };
});

export default Home;
