import { Box, Flex, Heading, Image, Link } from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getProductsByNode } from "../../services/hierarchy";
import type { ProductResponseWithImage } from "../../lib/product-types";
import { connectProductsWithMainImages } from "../../lib/product-util";

interface IFeaturedProductsBaseProps {
  title: string;
  linkProps?: {
    link: string;
    text: string;
  };
}

interface IFeaturedProductsProvidedProps extends IFeaturedProductsBaseProps {
  type: "provided";
  products: ProductResponseWithImage[];
}

interface IFeaturedProductsFetchProps extends IFeaturedProductsBaseProps {
  type: "fetch";
  nodeId: string;
}

type IFeaturedProductsProps =
  | IFeaturedProductsFetchProps
  | IFeaturedProductsProvidedProps;

const FeaturedProducts = (props: IFeaturedProductsProps): JSX.Element => {
  const router = useRouter();
  const { type, title, linkProps } = props;

  const [products, setProducts] = useState<ProductResponseWithImage[]>(
    type === "provided" ? props.products : []
  );

  const fetchNodeProducts = useCallback(async () => {
    if (type === "fetch") {
      const { data, included } = await getProductsByNode(props.nodeId);
      let products = data.slice(0, 4);
      if (included?.main_images) {
        products = connectProductsWithMainImages(
          products,
          included.main_images
        );
      }
      setProducts(products);
    }
  }, [props, type]);

  useEffect(() => {
    try {
      fetchNodeProducts();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }, [fetchNodeProducts]);

  return (
    <Box maxW={"80rem"} m="0 auto">
      <Flex justifyContent="space-between">
        <Heading
          as="h2"
          fontSize={{ base: "1.1rem", md: "1.3rem", lg: "1.5rem" }}
          fontWeight="extrabold"
        >
          {title}
        </Heading>
        {linkProps && (
          <Link
            color={"#0033CC"}
            fontWeight={"bold"}
            fontSize={{ base: "sm", md: "md", lg: "lg" }}
            onClick={() => {
              linkProps.link && router.push(linkProps.link);
            }}
          >
            {linkProps.text} →
          </Link>
        )}
      </Flex>
      <Flex
        justifyContent="space-around"
        alignItems="center"
        mt={4}
        mb={8}
        flexWrap="wrap"
      >
        {products.map((product) => (
          <Box key={product.id} textAlign="center">
            <Image
              width={290}
              height={290}
              alt={product.main_image?.file_name || "Empty"}
              src={product.main_image?.link.href}
              fallbackSrc="/images/image_placeholder.svg"
              borderRadius={5}
              objectFit="cover"
            />

            <Box fontSize={14} mt={8} color="gray.500">
              {product.attributes.sku}
            </Box>
            <Box p="2" fontWeight="semibold">
              {product.attributes.name}
            </Box>
            <Box>{product.meta.display_price?.without_tax.formatted}</Box>
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default FeaturedProducts;
