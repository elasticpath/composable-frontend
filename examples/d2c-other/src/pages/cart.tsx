import React, { useState, useEffect } from "react";
import QuantityHandler from "../components/quantityHandler/QuantityHandler";
import Link from "next/link";
import {
  Heading,
  Grid,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  TableContainer,
  useColorModeValue,
  Divider,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useCartItems } from "../context/cart";
import { Promotion } from "../components/promotion/Promotion";
import Image from "next/image";
import { removeCartItem } from "../services/cart";
import type { NextPage } from "next";

export const Cart: NextPage<{}> = () => {
  const { cartData, updateCartItems, totalPrice, promotionItems, mcart } =
    useCartItems();

  const [subTotal, SetSubTotal] = useState(0.0);

  useEffect(() => {
    const subtotal = cartData.reduce((pre, item) => {
      return pre + item.unit_price.amount * item.quantity;
    }, 0);
    SetSubTotal(subtotal);
  }, [cartData, totalPrice, promotionItems]);

  const handleRemovePromotion = () => {
    removeCartItem(mcart, promotionItems[0].id)
      .then(() => {
        updateCartItems();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleRemoveItem = (id: string) => {
    removeCartItem(mcart, id)
      .then(() => {
        updateCartItems();
      })
      .catch((error) => {
        console.error(error.errors);
      });
  };
  const colorBlue = useColorModeValue("blue.900", "blue.50");
  const colorWhite = useColorModeValue("white", "gray.900");

  return (
    <div>
      <Heading p="6">Your Shopping Cart</Heading>
      {cartData && cartData.length > 0 ? (
        <Grid templateColumns="2.5fr 1fr" columnGap="60px" p="12px">
          <TableContainer>
            <Table variant="simple">
              <Thead backgroundColor="gray.100" padding="24px">
                <Tr>
                  <Th py="16px">Product</Th>
                  <Th py="16px">SKU</Th>
                  <Th py="16px" isNumeric>
                    Unit Price
                  </Th>
                  <Th py="16px">Quantity</Th>
                  <Th py="16px" isNumeric>
                    Line Subtotal
                  </Th>
                  <Th py="16px">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {cartData.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      {item.image && item.image.href && (
                        <Image
                          src={item.image.href}
                          alt="Vercel Logo"
                          width={48}
                          height={48}
                          objectFit="fill"
                        />
                      )}
                    </Td>
                    <Td>{item.sku}</Td>
                    <Td isNumeric>
                      {item.meta.display_price.without_tax.unit.formatted}
                    </Td>
                    <Td>
                      <QuantityHandler item={item} size="sm" />
                    </Td>
                    <Td isNumeric>
                      {item.meta.display_price.without_tax.value.formatted}
                    </Td>
                    <Td>
                      <Button
                        onClick={() => {
                          handleRemoveItem(item.id);
                        }}
                      >
                        Remove
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          <Box backgroundColor="gray.100" p="24px">
            <Table variant="simple">
              <Tbody>
                <Tr>
                  <Td>Subtotal</Td>
                  <Td isNumeric>{subTotal}</Td>
                </Tr>
                <Tr>
                  <Td>
                    <VStack alignItems="start">
                      <Text>Discount</Text>
                      {promotionItems && promotionItems.length > 0 && (
                        <Text color="red.600">( {promotionItems[0].sku} )</Text>
                      )}
                    </VStack>
                  </Td>
                  <Td isNumeric>
                    {promotionItems && promotionItems.length > 0 ? (
                      <VStack alignItems="end">
                        <Text>
                          {
                            promotionItems[0].meta.display_price.without_tax
                              .unit.formatted
                          }
                        </Text>
                        <Button
                          mt={["0rem !important"]}
                          p="0"
                          onClick={handleRemovePromotion}
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
                <Tr fontWeight="semibold">
                  <Td>Order Total</Td>
                  <Td isNumeric>{totalPrice}</Td>
                </Tr>
              </Tbody>
            </Table>

            <Divider my="2" />
            <Promotion />
            <Divider my="2" />
            <Grid templateColumns="repeat(2, 1fr)" gap={2}>
              <Link href={"/"} passHref>
                <Button
                  _hover={{
                    color: "blue.700",
                    boxShadow: "lg",
                  }}
                  colorScheme={colorBlue}
                  variant="outline"
                >
                  Continue Shopping
                </Button>
              </Link>
              <Link href={"/checkout"} passHref>
                <Button
                  bg={colorBlue}
                  color={colorWhite}
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
        </Grid>
      ) : (
        <Box p="16">
          <Image alt="" src="/icons/empty.svg" width="488px" height="461px" />
        </Box>
      )}
    </div>
  );
};
export default Cart;
