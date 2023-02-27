import { SearchHit } from "./SearchHit";
import {
  Button,
  Center,
  Flex,
  Grid,
  GridItem,
  Heading,
  Image,
  LinkBox,
  LinkOverlay,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { ViewOffIcon } from "@chakra-ui/icons";
import Link from "next/link";
import Price from "../product/Price";
import StrikePrice from "../product/StrikePrice";
import { ProductModalContainer } from "../product-modal/ProductModalContainer";
import { EP_CURRENCY_CODE } from "../../lib/resolve-ep-currency-code";

export default function HitComponent({ hit }: { hit: SearchHit }): JSX.Element {
  const { ep_price, ep_name, objectID, ep_main_image_url, ep_description } =
    hit;

  const currencyPrice = ep_price?.[EP_CURRENCY_CODE];
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <LinkBox display="grid" gridTemplateRows="auto 1fr" h="full">
      <GridItem position="relative" overflow="hidden" pb="100%">
        {ep_main_image_url ? (
          <Image
            boxSize="100%"
            position="absolute"
            objectFit="cover"
            src={ep_main_image_url}
            alt={ep_name}
            roundedTop="lg"
          />
        ) : (
          <Center
            w="100%"
            h="100%"
            bg="gray.200"
            color="white"
            position="absolute"
          >
            <ViewOffIcon w="10" h="10" />
          </Center>
        )}
      </GridItem>
      <Grid gridTemplateRows="auto 1fr auto" gap={2} p={4}>
        <Heading size="sm">
          <Link href={`/products/${objectID}`} passHref>
            <LinkOverlay>{ep_name}</LinkOverlay>
          </Link>
        </Heading>
        <Text
          color="gray.500"
          fontWeight="semibold"
          letterSpacing="wide"
          fontSize="xs"
          mt="1"
          noOfLines={6}
        >
          {ep_description}
        </Text>
        {currencyPrice && (
          <Flex alignItems="center" mt="1">
            <Price
              price={currencyPrice.formatted_price}
              currency={EP_CURRENCY_CODE}
            />
            {currencyPrice.sale_prices && (
              <StrikePrice
                price={currencyPrice.sale_prices.original_price.formatted_price}
                currency={EP_CURRENCY_CODE}
                fontSize="lg"
              />
            )}
          </Flex>
        )}
        <Button
          rounded="md"
          w="full"
          mt={4}
          py="7"
          bg={useColorModeValue("brand.primary", "blue.50")}
          color={useColorModeValue("white", "gray.900")}
          _hover={{
            transform: "translateY(-2px)",
            boxShadow: "lg",
          }}
          onClick={onOpen}
        >
          Quick View
        </Button>
      </Grid>
      <ProductModalContainer
        isOpen={isOpen}
        onClose={onClose}
        productId={objectID}
      />
    </LinkBox>
  );
}
