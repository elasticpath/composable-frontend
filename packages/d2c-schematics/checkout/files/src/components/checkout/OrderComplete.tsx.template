import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  Heading,
  Link,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
  VStack,
} from "@chakra-ui/react";
import { OrderCompleteState } from "./types/order-pending-state";
import { ChakraNextImage } from "../ChakraNextImage";
import NextLink from "next/link";
import { PresentCartState } from "@elasticpath/react-shopper-hooks";

interface IOrderComplete {
  state: OrderCompleteState;
}

export default function OrderComplete({
  state: {
    paymentResponse,
    cart,
    checkoutForm: {
      shippingAddress,
      billingAddress,
      personal: { email },
    },
  },
}: IOrderComplete): JSX.Element {
  return (
    <Grid gap={1}>
      <Heading as="h3" fontSize="md">
        Thank you for your order!
      </Heading>
      <Heading as="h2" fontSize="3xl">
        Order Complete
      </Heading>
      <Text fontSize="md">Your order number: {paymentResponse.data.id}</Text>
      <Divider my={8} />
      <Grid gap={8}>
        {cart.items.map((item) => {
          return (
            <Grid
              key={item.id}
              gap={4}
              gridTemplateColumns="auto 1fr"
              borderBottomWidth="1px"
              pb={8}
              _last={{ borderBottomWidth: 0 }}
            >
              <GridItem>
                <NextLink href={`/products/${item.product_id}`} passHref>
                  <Link>
                    <ChakraNextImage
                      src={item.image.href}
                      alt={item.name}
                      width={264}
                      height={264}
                      w="10rem"
                      h="10rem"
                      overflow="hidden"
                      rounded="lg"
                    />
                  </Link>
                </NextLink>
              </GridItem>
              <Grid gap={1} gridTemplateRows="auto 1fr auto">
                <Text fontWeight="semibold">{item.name}</Text>
                <Text fontSize="sm" fontWeight="light" noOfLines={5}>
                  {item.description}
                </Text>
                <Flex gap={4} fontSize="sm">
                  <Text fontWeight="medium">{`Quantity ${item.quantity}`}</Text>
                  <Divider orientation="vertical" />
                  <Text fontWeight="medium">
                    {`Price ${item.meta.display_price.with_tax.value.formatted}`}
                  </Text>
                </Flex>
              </Grid>
            </Grid>
          );
        })}
      </Grid>
      <Divider my={8} />
      <Grid
        columnGap={4}
        rowGap={8}
        gridTemplateColumns={{ base: "1fr", sm: "repeat(3, 1fr)" }}
        fontSize="sm"
      >
        <AddressBlock label="Shipping Address" {...shippingAddress} />
        <AddressBlock
          label="Billing Address"
          {...(billingAddress ?? shippingAddress)}
        />
        <GridItem>
          <Text fontWeight="medium" pb={2}>
            Contact Information
          </Text>
          <Text>{email}</Text>
        </GridItem>
      </Grid>
      <Divider my={8} />
      <CompleteOrderSummary cart={cart} />
      <GridItem mt={8} justifySelf="right">
        <NextLink href="/" passHref>
          <Button
            bg="brand.primary"
            color="white"
            _hover={{
              backgroundColor: "brand.highlight",
              boxShadow: "m",
            }}
            variant="solid"
          >
            Continue Shopping
          </Button>
        </NextLink>
      </GridItem>
    </Grid>
  );
}

interface IAddressBlock {
  label: string;
  first_name: string;
  last_name: string;
  line_1: string;
  line_2?: string;
  postcode: string;
  region: string;
}

function AddressBlock({
  label,
  first_name,
  last_name,
  region,
  line_1,
  line_2,
  postcode,
}: IAddressBlock): JSX.Element {
  return (
    <Box>
      <Text fontWeight="medium" pb={2}>
        {label}
      </Text>
      <Text>{`${first_name} ${last_name}`}</Text>
      <Text>{line_1}</Text>
      <Text>{line_2}</Text>
      <Text>{postcode}</Text>
      <Text>{region}</Text>
    </Box>
  );
}

interface ICompleteOrderSummary {
  cart: PresentCartState;
}

function CompleteOrderSummary({
  cart: {
    withTax,
    withoutTax,
    groupedItems: { promotion },
  },
}: ICompleteOrderSummary): JSX.Element {
  return (
    <Table variant="simple">
      <Tbody>
        <Tr fontSize={14}>
          <Td color="gray.600" pl={0}>
            Subtotal
          </Td>
          <Td isNumeric>{withoutTax}</Td>
        </Tr>
        <Tr fontSize={14}>
          <Td color="gray.600" pl={0}>
            <VStack alignItems="start">
              <Text>Discount</Text>
              {promotion.length > 0 && (
                <Text color="red.600">( {promotion[0].sku} )</Text>
              )}
            </VStack>
          </Td>
          <Td isNumeric fontSize={14}>
            {promotion && promotion.length > 0 ? (
              <VStack alignItems="end">
                <Text>
                  {promotion[0].meta.display_price.without_tax.unit.formatted}
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
          <Td isNumeric>{withTax}</Td>
        </Tr>
      </Tbody>
    </Table>
  );
}
