import { Flex, Heading, Link } from "@chakra-ui/react";

import NextLink from "next/link";
import { menuItemStyleProps } from "../lib/menu-style";
import { withStoreStaticProps } from "../lib/store-wrapper-ssg";

export default function Custom404() {
  return (
    <Flex
      direction="column"
      h="xl"
      alignItems="center"
      justifyContent="center"
      gap={4}
      p={8}
    >
      <Heading fontSize={{ base: "xl", md: "3xl" }} textAlign="center">
        404 - The page could not be found.
      </Heading>
      <NextLink href="/" passHref>
        <Link {...menuItemStyleProps} fontSize={{ base: "md", md: "lg" }}>
          Back to home
        </Link>
      </NextLink>
    </Flex>
  );
}

export const getStaticProps = withStoreStaticProps();
