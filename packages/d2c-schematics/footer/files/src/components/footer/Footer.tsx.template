import {
  Box,
  Container,
  HStack,
  Link,
  SimpleGrid,
  Stack,
} from "@chakra-ui/react";

import { globalBaseWidth } from "../../styles/theme";
import { InfoIcon, PhoneIcon } from "@chakra-ui/icons";
import GithubIcon from "../../../public/icons/github.svg";
import EpLogo from "../../../public/icons/ep-logo.svg";

const Footer = (): JSX.Element => (
  <Box as="footer" borderTop="1px" borderColor="gray.200" bg="white">
    <Container
      as={Stack}
      maxW={globalBaseWidth}
      py={10}
      borderBottom="1px"
      borderColor="gray.200"
    >
      <SimpleGrid columns={{ base: 1, sm: 2, md: 5 }} spacing={8}>
        <Stack align="flex-start">
          <EpLogo width={120} height={40} />
        </Stack>
        <Stack align="flex-start">
          <Link href="/">Home</Link>
          <Link href="/shipping">Shipping</Link>
          <Link href="/faq">FAQ</Link>
        </Stack>
        <Stack align="flex-start">
          <Link href="/about">About</Link>
          <Link href="/terms">Terms</Link>
        </Stack>
        <Stack align="flex-start"></Stack>
        <HStack align="flex-start" justifyContent="flex-end">
          <Box>
            <Link
              href="https://github.com/elasticpath/d2c-reference-store"
              _hover={{
                color: "brand.primary",
              }}
            >
              <GithubIcon width={25} height={25} />
            </Link>
          </Box>
          <Box>
            <Link
              href="https://www.elasticpath.com"
              ml={4}
              _hover={{
                color: "brand.primary",
              }}
            >
              <InfoIcon width={25} height={25} />
            </Link>
          </Box>
          <Box>
            <Link
              href="https://www.elasticpath.com/company/contact-us#contact-information"
              ml={4}
              _hover={{
                color: "brand.primary",
              }}
            >
              <PhoneIcon width={25} height={25} />
            </Link>
          </Box>
        </HStack>
      </SimpleGrid>
    </Container>
  </Box>
);

export default Footer;
