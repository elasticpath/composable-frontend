import Image from "next/image";
import {
  Box,
  Container,
  Link,
  SimpleGrid,
  Stack,
  Text,
  Flex,
  Tag,
  useColorModeValue,
} from "@chakra-ui/react";

const ListHeader = ({ children }: { children: ReactNode }) => {
  return (
    <Text fontWeight={"500"} fontSize={"lg"} mb={2}>
      {children}
    </Text>
  );
};

import { ReactNode } from "react";
const Footer = (): JSX.Element => {
  return (
    <Box
      bg={useColorModeValue("gray.50", "gray.900")}
      color={useColorModeValue("gray.700", "gray.200")}
    >
      <Container as={Stack} maxW={"6xl"} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} spacing={8}>
          <Stack align={"flex-start"}>
            <ListHeader>Products</ListHeader>
            <Link href={"#"}>Bags</Link>
            <Link href={"#"}>Tees</Link>
            <Link href={"#"}>Objects</Link>
            <Link href={"#"}>Home Goods</Link>
            <Link href={"#"}>Accessories</Link>
          </Stack>
          <Stack align={"flex-start"}>
            <ListHeader>Customer Service</ListHeader>
            <Link href={"#"}>Contact</Link>
            <Link href={"#"}>Shipping</Link>
            <Link href={"#"}>Returns</Link>
            <Link href={"#"}>Warranty</Link>
            <Link href={"#"}>Secure Payments</Link>
            <Link href={"#"}>FAQ</Link>
            <Link href={"#"}>Find a store</Link>
          </Stack>
          <Stack align={"flex-start"}>
            <ListHeader>Company</ListHeader>
            <Link href={"#"}>Who we are</Link>
            <Link href={"#"}>Sustainability</Link>
            <Link href={"#"}>Press</Link>
            <Link href={"#"}>Careers</Link>
            <Link href={"#"}>Terms & Conditions</Link>
            <Link href={"#"}>Privacy</Link>
          </Stack>
          <Stack align={"flex-start"}>
            <ListHeader>Legal</ListHeader>
            <Link href={"#"}>Terms of Service</Link>
            <Link href={"#"}>Return Policy</Link>
            <Link href={"#"}>Privacy Policy</Link>
            <Link href={"#"}>Shipping Policy</Link>
          </Stack>
        </SimpleGrid>
      </Container>
      <Box py={10}>
        <Flex
          align={"center"}
          _before={{
            content: '""',
            borderBottom: "1px solid",
            borderColor: useColorModeValue("gray.200", "gray.700"),
            flexGrow: 1,
            mr: 8,
          }}
          _after={{
            content: '""',
            borderBottom: "1px solid",
            borderColor: useColorModeValue("gray.200", "gray.700"),
            flexGrow: 1,
            ml: 8,
          }}
        >
          <Image
            src="/icons/ep-logo.svg"
            alt="ep Logo"
            width={150}
            height={25}
          />
        </Flex>
        <Text pt={6} fontSize={"sm"} textAlign={"center"}>
          © 2022, Elastic Path Software Inc. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
};

export default Footer;
