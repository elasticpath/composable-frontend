import type { NextPage } from "next";
import { chakra, Grid, GridItem } from "@chakra-ui/react";

import type { Node } from "@moltin/sdk";
import FeaturedProducts from "../components/featured-products/FeaturedProducts";
import { fetchFeaturedProducts } from "../components/featured-products/fetchFeaturedProducts";
import { ProductResponseWithImage } from "../lib/types/product-types";
import PromotionBanner, {
  IPromotion,
} from "../components/promotion-banner/PromotionBanner";

import { withStoreStaticProps } from "../lib/store-wrapper-ssg";

export interface IHome {
  featuredProducts?: ProductResponseWithImage[];
  featuredNodes?: Node[];
  promotion?: IPromotion;
}

const Home: NextPage<IHome> = ({ featuredProducts, promotion }) => {
  return (
    <chakra.main>
      {promotion && (
        <PromotionBanner
          promotion={promotion}
          linkProps={{
            link: "/search",
            text: "Shop Now",
          }}
        />
      )}
      <Grid gap="12" padding={{ base: "2rem", md: "4rem" }}>
        <GridItem>
          {featuredProducts && (
            <FeaturedProducts
              title="Trending Products"
              linkProps={{
                link: `/search`,
                text: "See all products",
              }}
              type="provided"
              products={featuredProducts}
            />
          )}
        </GridItem>
      </Grid>
    </chakra.main>
  );
};

export const getStaticProps = withStoreStaticProps<IHome>(async () => {
  // Fetching static data for the home page
  const featuredProducts = await fetchFeaturedProducts();

  return {
    props: {
      promotion: {
        title: "Your Elastic Path storefront",
        description:
          "This marks the beginning, embark on the journey of crafting something truly extraordinary, uniquely yours.",
      },
      ...(featuredProducts && { featuredProducts }),
    },
  };
});

export default Home;
