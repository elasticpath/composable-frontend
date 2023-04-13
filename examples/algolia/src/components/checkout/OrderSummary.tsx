import {
  Box,
  Button,
  Divider,
  Grid,
  GridItem,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
  VStack,
} from "@chakra-ui/react";
import {
  PromotionCartItem,
  RefinedCartItem,
} from "@elasticpath/react-shopper-hooks";
import { NonEmptyArray } from "../../lib/types/non-empty-array";
import { ReadonlyNonEmptyArray } from "../../lib/types/read-only-non-empty-array";
import NextLink from "next/link";
import { ChakraNextImage } from "../ChakraNextImage";

interface IOrderSummary {
  items:
    | RefinedCartItem[]
    | NonEmptyArray<RefinedCartItem>
    | ReadonlyNonEmptyArray<RefinedCartItem>;
  promotionItems: PromotionCartItem[];
  totalPrice: string;
  subtotal: string;
}

export function OrderSummary({
  items,
  promotionItems,
  totalPrice,
  subtotal,
}: IOrderSummary): JSX.Element {
  return (
    <Box backgroundColor="gray.50" p={8} borderRadius={6}>
      <Text fontSize="lg" fontWeight={500}>
        Order Summary
      </Text>
      {items.map((item) => (
        <Grid key={item.id} my="4" templateColumns="auto 1fr" gap={3}>
          <GridItem>
            {item.image?.href && (
              <NextLink href={`/products/${item.product_id}`} passHref>
                <Link>
                  <ChakraNextImage
                    src={item.image.href}
                    alt={item.name}
                    width={192}
                    height={192}
                    w="5rem"
                    h="5rem"
                    overflow="hidden"
                    rounded="lg"
                  />
                </Link>
              </NextLink>
            )}
          </GridItem>
          <GridItem>
            <Text
              fontWeight="medium"
              fontSize={{ base: "sm", lg: "md" }}
              mb="4px"
            >
              {item.name}
            </Text>
            <Text mb="4px" fontSize={{ base: "sm", lg: "md" }}>
              {item.meta.display_price.without_tax.value.formatted}
            </Text>
            <Text fontWeight="light" fontSize={{ base: "xs", lg: "sm" }}>
              Qty {item.quantity}
            </Text>
          </GridItem>
        </Grid>
      ))}
      <Divider />
      <Table variant="simple">
        <Tbody>
          <Tr fontSize={14}>
            <Td color="gray.600" pl={0}>
              Subtotal
            </Td>
            <Td isNumeric>{subtotal}</Td>
          </Tr>
          <Tr fontSize={14}>
            <Td color="gray.600" pl={0}>
              <VStack alignItems="start">
                <Text>Discount</Text>
                {promotionItems && promotionItems.length > 0 && (
                  <Text color="red.600">( {promotionItems[0].sku} )</Text>
                )}
              </VStack>
            </Td>
            <Td isNumeric fontSize={14}>
              {promotionItems && promotionItems.length > 0 ? (
                <VStack alignItems="end">
                  <Text>
                    {
                      promotionItems[0].meta.display_price.without_tax.unit
                        .formatted
                    }
                  </Text>
                  <Button
                    mt={["0rem !important"]}
                    p="0"
                    _hover={{
                      bgColor: "none",
                      color: "red.600",
                    }}
                  >
                    Remove
                  </Button>
                </VStack>
              ) : (
                "$0.00"
              )}
            </Td>
          </Tr>
          <Tr fontWeight="medium">
            <Td pl={0} fontSize={{ base: "sm", lg: "md" }}>
              Order Total
            </Td>
            <Td isNumeric>{totalPrice}</Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
}
