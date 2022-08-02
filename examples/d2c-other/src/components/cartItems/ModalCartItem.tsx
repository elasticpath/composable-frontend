import QuantityHandler from "../quantityHandler/QuantityHandler";
import {
  Text,
  Button,
  useColorModeValue,
  Grid,
  GridItem,
  Heading,
  Divider,
  Flex,
} from "@chakra-ui/react";
import Link from "next/link";
import { useCartItems } from "../../context/cart";
import { removeCartItem } from "../../services/cart";
import Image from "next/image";

export default function ModalCartItems(): JSX.Element {
  const { cartData, mcart, updateCartItems } = useCartItems();

  const handleRemove = (id: string) => {
    removeCartItem(mcart, id)
      .then(() => {
        updateCartItems();
      })
      .catch((error) => {
        console.error(error.errors);
      });
  };

  const color = useColorModeValue("blue.900", "blue.50");

  return (
    <>
      {cartData && cartData.length > 0 ? (
        <>
          {cartData.map((item) => (
            <div key={item.id}>
              <Grid key={item.id} my="4" templateColumns="1fr 3fr" gap={1}>
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
                  <Flex gap={8}>
                    <QuantityHandler item={item} size="xs" />
                    <Button
                      size="xs"
                      onClick={() => {
                        handleRemove(item.id);
                      }}
                    >
                      Remove
                    </Button>
                  </Flex>
                </GridItem>
              </Grid>
              <Divider />
            </div>
          ))}
        </>
      ) : (
        <Flex
          flexDirection="column"
          gap={4}
          justifyContent="center"
          height="100%"
        >
          <Text textAlign="center">You have no items in your cart!</Text>
          <Link href={"/"} passHref>
            <Button
              _hover={{
                color: "blue.700",
                boxShadow: "lg",
              }}
              width="100%"
              colorScheme={color}
              variant="outline"
            >
              Start Shopping
            </Button>
          </Link>
        </Flex>
      )}
    </>
  );
}
