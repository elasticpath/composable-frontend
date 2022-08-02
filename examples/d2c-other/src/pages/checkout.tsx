import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Link from "next/link";
import {
  Heading,
  Grid,
  Box,
  useColorModeValue,
  Text,
  Table,
  GridItem,
  Tbody,
  Tr,
  Flex,
  Td,
  Divider,
  Checkbox,
  VStack,
} from "@chakra-ui/react";
import { useCartItems } from "../context/cart";
import { useCheckoutForm } from "../context/checkout";
import Image from "next/image";
import { checkout, payment, removeAllCartItems } from "../services/checkout";
import PersonalInfo from "../components/checkout/PersonalInfo";
import ShippingForm from "../components/checkout/ShippingForm";
import PaymentForm from "../components/checkout/PaymentForm";
import ShippingInfo from "../components/checkout/ShippingInfo";
import type { NextPage } from "next";
import { stripeEnv } from "../lib/resolve-stripe-env";

const stripePromise = loadStripe(stripeEnv);

export const Checkout: NextPage<{}> = () => {
  const {
    shippingAddress,
    billingAddress,
    isSameAddress,
    setSameAddress,
    isEditShippingForm,
    isEditBillingForm,
  } = useCheckoutForm();
  const { promotionItems, updateCartItems, totalPrice, cartData } =
    useCartItems();

  const [formStep, setFormStep] = useState(0);

  const nextFormStep = () => setFormStep((currentStep) => currentStep + 1);

  const [subTotal, SetSubTotal] = useState(0.0);

  useEffect(() => {
    const subtotal = cartData.reduce((pre, item) => {
      return pre + item.unit_price.amount * item.quantity;
    }, 0);
    SetSubTotal(subtotal);
  }, [cartData, totalPrice, promotionItems]);

  const onPayOrder = async (token: string) => {
    console.log("came here", token);
    try {
      const mcart = localStorage.getItem("mcart") || "";
      const billing = isSameAddress ? shippingAddress : billingAddress;
      const shipping = shippingAddress;
      const name = `${billingAddress.first_name} ${billingAddress.last_name}`;
      const customerData = { name: name, email: billingAddress.email };
      const orderRes = await checkout(mcart, customerData, billing, shipping);
      const paymentParams = {
        gateway: "stripe_connect",
        method: "purchase",
        payment: "pm_card_visa",
      };
      await payment(paymentParams, orderRes.data.id);
      await removeAllCartItems(mcart);
      updateCartItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box px={24} py={8}>
      <Heading>Checkout</Heading>
      <Grid templateColumns="1.7fr 1fr" columnGap="60px" mt="16px">
        <Box border={"1px solid white"}>
          <Box
            p={4}
            bg={useColorModeValue("blue.900", "blue.50")}
            color={useColorModeValue("white", "gray.900")}
          >
            <Text casing="uppercase"> personal info</Text>
          </Box>
          {formStep >= 0 && <PersonalInfo nextFormStep={nextFormStep} />}
          <Box
            p={4}
            bg={useColorModeValue("blue.900", "blue.50")}
            borderBottom="4px solid white"
            color={useColorModeValue("white", "gray.900")}
          >
            <Text casing="uppercase"> shipping & billing info</Text>
          </Box>
          <Box p={4}>
            {formStep >= 1 && (
              <Box>
                <Heading pb={4} size="md">
                  Shipping Address
                </Heading>
                {isEditShippingForm ? (
                  <ShippingForm nextFormStep={nextFormStep} type="shipping" />
                ) : (
                  <ShippingInfo type="shipping" />
                )}
                <form>
                  <Box py={4}>
                    <Heading pb={4} size="md">
                      billing Address
                    </Heading>
                    <Checkbox
                      // @ts-ignore
                      defaultChecked={isSameAddress}
                      // @ts-ignore
                      value={isSameAddress}
                      onChange={(e) => {
                        setSameAddress(e.target.checked);
                      }}
                    >
                      Same as Shipping Address
                    </Checkbox>
                  </Box>
                </form>
                {isEditBillingForm
                  ? !isSameAddress && (
                      <ShippingForm
                        nextFormStep={nextFormStep}
                        type="billing"
                      />
                    )
                  : !isSameAddress && <ShippingInfo type="billing" />}
              </Box>
            )}
          </Box>
          <Box
            p={4}
            bg={useColorModeValue("blue.900", "blue.50")}
            color={useColorModeValue("white", "gray.900")}
          >
            <Text casing="uppercase"> payment info</Text>
          </Box>
          {formStep >= 2 && (
            <Elements stripe={stripePromise}>
              <PaymentForm onPayOrder={onPayOrder} />
            </Elements>
          )}
        </Box>
        <Box backgroundColor="gray.100" p="24px" height="max-content">
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
                          promotionItems[0].meta.display_price.without_tax.unit
                            .formatted
                        }
                      </Text>
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
          <Grid templateColumns="1fr 1fr">
            <Heading size="sm">Items in your cart</Heading>
            <Box justifySelf="end" _hover={{ textDecoration: "underline" }}>
              <Link href="/cart">Edit Cart</Link>
            </Box>
          </Grid>
          {cartData.map((item) => (
            <Box key={item.id}>
              <Grid my="4" templateColumns="1fr 3fr" gap={1}>
                <GridItem alignSelf="center">
                  {item.image && item.image.href && (
                    <Image
                      src={item.image.href}
                      alt="Vercel Logo"
                      width={56}
                      height={56}
                      objectFit="fill"
                    />
                  )}
                </GridItem>
                <GridItem>
                  <Heading size="xs" mb="4px">
                    {item.name}
                  </Heading>
                  <Text mb="4px">
                    {item.meta.display_price.without_tax.value.formatted}
                  </Text>
                  <Flex gap={8}>Quantity: {item.quantity}</Flex>
                </GridItem>
              </Grid>
            </Box>
          ))}
        </Box>
      </Grid>
    </Box>
  );
};
export default Checkout;
