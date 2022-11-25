import { PromotionCartItem } from "@field123/epcc-react";
import {
  Box,
  Button,
  Grid,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { Promotion } from "./Promotion";
import Link from "next/link";

export function CartOrderSummary({
  cartId,
  totalPrice,
  subtotal,
  promotionItems,
  handleRemoveItem,
}: {
  cartId: string;
  totalPrice: string;
  subtotal: string;
  promotionItems: PromotionCartItem[];
  handleRemoveItem: (itemId: string) => Promise<void>;
}): JSX.Element {
  return (
    <Box backgroundColor="gray.50" p={8} borderRadius={6}>
      <Text fontSize="lg" fontWeight={500}>
        Order Summary
      </Text>
      <Table variant="simple">
        <Tbody>
          <Tr fontSize={14}>
            <Td color="gray.600" pl={0}>
              Subtotal
            </Td>
            <Td isNumeric>{subtotal}</Td>
          </Tr>
          {promotionItems?.map((item) => {
            return (
              <Tr key={item.id} fontSize={14}>
                <Td color="gray.600" pl={0}>
                  <VStack alignItems="start">
                    <Text>Discount</Text>
                    <Text color="red.600">{item.sku}</Text>
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
                        onClick={() => handleRemoveItem(item.id)}
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
            );
          })}
          <Tr fontWeight={500}>
            <Td pl={0}>Order Total</Td>
            <Td isNumeric>{totalPrice}</Td>
          </Tr>
        </Tbody>
      </Table>

      <Box mt={5}>
        <Promotion />
      </Box>
      <Grid
        gridTemplateColumns={{
          sm: "repeat(2, 1fr)",
          lg: "auto",
          xl: "repeat(2, 1fr)",
        }}
        gap={2}
        mt={5}
      >
        <Link href="/" passHref>
          <Button
            _hover={{
              color: "brand.highlight",
              boxShadow: "lg",
            }}
            colorScheme="brand.primary"
            variant="outline"
          >
            Continue Shopping
          </Button>
        </Link>
        <Link href={`/checkout/${cartId}`} passHref>
          <Button
            bg="brand.primary"
            color="white"
            _hover={{
              backgroundColor: "blue.700",
              boxShadow: "m",
            }}
            variant="solid"
          >
            Checkout
          </Button>
        </Link>
      </Grid>
    </Box>
  );
}
