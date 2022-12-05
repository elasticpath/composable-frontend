import { Box, Heading, Image } from "@chakra-ui/react";
import type { NextPage } from "next";
import { withStoreServerSideProps } from "../lib/store-wrapper-ssr";
import { useCart } from "@field123/epcc-react";
import Cart from "../components/cart/Cart";
import { resolveShoppingCartProps } from "../lib/resolve-shopping-cart-props";
import { globalBaseWidth } from "../styles/theme";

export const CartPage: NextPage = () => {
  const { removeCartItem, state } = useCart();

  const shoppingCartProps = resolveShoppingCartProps(state, removeCartItem);

  return (
    <Box
      px={{ base: 6, "2xl": 0 }}
      py={10}
      maxW={globalBaseWidth}
      m="0 auto"
      w="full"
    >
      {shoppingCartProps && (
        <>
          <Heading as="h1" pb={6} size={{ base: "md", sm: "lg" }}>
            Your Shopping Cart
          </Heading>
          <Cart {...shoppingCartProps} />
        </>
      )}
      {(state.kind === "empty-cart-state" ||
        state.kind === "uninitialised-cart-state" ||
        state.kind === "loading-cart-state") && (
        <>
          <Heading p={6} pl={0}>
            Your cart is empty
          </Heading>
          <Box p="16">
            <Image alt="" src="/icons/empty.svg" width="488px" height="461px" />
          </Box>
        </>
      )}
    </Box>
  );
};
export default CartPage;

export const getServerSideProps = withStoreServerSideProps();
