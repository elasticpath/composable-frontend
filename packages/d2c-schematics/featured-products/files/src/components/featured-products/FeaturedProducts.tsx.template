import {
  Box,
  Center,
  Flex,
  Heading,
  Image,
  Link,
  Text,
} from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getProductsByNode } from "../../services/hierarchy";
import type { ProductResponseWithImage } from "../../lib/types/product-types";
import { connectProductsWithMainImages } from "../../lib/product-util";
import { ArrowForwardIcon, ViewOffIcon } from "@chakra-ui/icons";
import { globalBaseWidth } from "../../styles/theme";

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
    <Box
      display={products.length ? "block" : "none"}
      maxW={globalBaseWidth}
      m="0 auto"
    >
      <Flex justifyContent="space-between">
        <Heading
          as="h2"
          fontSize={{ base: "1rem", md: "1.1rem", lg: "1.3rem" }}
          fontWeight="extrabold"
        >
          {title}
        </Heading>
        {linkProps && (
          <Link
            color="brand.primary"
            fontWeight="bold"
            fontSize={{ base: "sm", md: "md", lg: "lg" }}
            onClick={() => {
              linkProps.link && router.push(linkProps.link);
            }}
          >
            {linkProps.text} <ArrowForwardIcon />
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
          <Link
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            p={4}
            flex={{ base: "100%", md: "50%", lg: "25%" }}
            key={product.id}
            href="/category"
          >
            <Box width="100%" maxW={64} textAlign="center">
              {product.main_image?.link.href ? (
                <Image
                  width={64}
                  height={64}
                  alt={product.main_image?.file_name || "Empty"}
                  src={product.main_image?.link.href}
                  borderRadius={5}
                  objectFit="cover"
                  boxShadow="sm"
                />
              ) : (
                <Center
                  width={64}
                  height={64}
                  bg="gray.200"
                  color="white"
                  borderRadius={5}
                  objectFit="cover"
                  boxShadow="sm"
                >
                  <ViewOffIcon w="10" h="10" />
                </Center>
              )}

              <Text p="2" fontWeight="semibold">
                {product.attributes.name}
              </Text>
              <Text>{product.meta.display_price?.without_tax.formatted}</Text>
            </Box>
          </Link>
        ))}
      </Flex>
    </Box>
  );
};

export default FeaturedProducts;
