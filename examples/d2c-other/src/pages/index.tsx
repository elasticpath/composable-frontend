import type { GetStaticProps, NextPage } from "next";
import type { Hierarchy, Node, Promotion } from "@moltin/sdk";
import "pure-react-carousel/dist/react-carousel.es.css";
import { chakra, Grid, GridItem } from "@chakra-ui/react";
import {
  getHierarchies,
  getNodeChildren,
  getNodes,
} from "../services/hierarchy";
import { StaticProduct, staticProducts } from "../lib/product-data";
import ProductShowcaseCarousel from "../components/product/carousel/ProductShowcaseCarousel";
import PromotionBanner from "../components/PromotionBanner/PromotionBanner";
import { getPromotionById } from "../services/promotions";
import FeaturedProducts from "../components/FeaturedProducts/FeaturedProducts";
import { getProductsByNode } from "../services/hierarchy";
import { connectProductsWithMainImages } from "../lib/product-util";
import NodeDisplay from "../components/node/NodeDisplay";
import { ProductResponseWithImage } from "../lib/product-types";

export interface IHome {
  staticProducts: StaticProduct[];
  hierarchies?: Hierarchy[];
  categoryNodes: Node[];
  promotion: Promotion;
  featuredNodeProducts: ProductResponseWithImage[];
}

const Home: NextPage<IHome> = ({
  staticProducts,
  promotion,
  featuredNodeProducts,
  categoryNodes,
}) => {
  const nodeId = "4cb5301a-9da3-41a4-9402-c104ed1c2569";
  return (
    <chakra.main>
      <PromotionBanner
        type="provided"
        promotion={promotion}
        linkProps={{
          link: "/cart",
          text: "Shop Now",
        }}
      />
      <Grid gap="12" padding={{ base: "2rem", md: "4rem" }}>
        <GridItem>
          <FeaturedProducts
            title="Trending Products"
            linkProps={{
              link: `/category/${nodeId}`,
              text: "See all products",
            }}
            type="provided"
            products={featuredNodeProducts}
          />
        </GridItem>
        <GridItem>
          <NodeDisplay
            type="provided"
            nodes={categoryNodes}
            linkProps={{ text: "Browse all categories", link: "/category" }}
            title="Shop by Category"
          ></NodeDisplay>
        </GridItem>
      </Grid>
      <ProductShowcaseCarousel products={staticProducts} />
    </chakra.main>
  );
};

export const getStaticProps: GetStaticProps<IHome> = async () => {
  // Fetching static data for the home page

  // Fetching the data for a specific promotion for the home page PromotionBanner
  const { data: promotion } = await getPromotionById(
    "885709b4-0053-48ee-91a2-bc9f7eb41d27"
  );

  // Fetching the first 4 products of a node to display in the FeaturedProducts component
  const { data: nodeProductsResponse, included: nodeProductsIncluded } =
    await getProductsByNode("4cb5301a-9da3-41a4-9402-c104ed1c2569");

  const featuredNodeProducts = nodeProductsIncluded?.main_images
    ? connectProductsWithMainImages(
        nodeProductsResponse.slice(0, 4), // Only need the first 4 products to feature
        nodeProductsIncluded?.main_images
      )
    : [];

  // Fetching a nodes to display in the NodeDisplay component
  const hierarchies = await getHierarchies();
  const hierarchyChildren =
    hierarchies.length > 0 ? await getNodes(hierarchies[0].id) : [];
  // As an example, use first hierarchy's child, if there is one
  const parentNode =
    hierarchyChildren.length > 0 ? hierarchyChildren[0] : undefined;

  const categoryNodes = parentNode ? await getNodeChildren(parentNode?.id) : [];

  return {
    props: {
      staticProducts,
      promotion,
      featuredNodeProducts,
      hierarchies,
      categoryNodes,
    },
  };
};

export default Home;
