import { Heading, Grid, Box, GridItem } from "@chakra-ui/react";
import type { NextPage } from "next";
import {
  Cart,
  CartIncluded,
  ConfirmPaymentResponse,
  ResourceIncluded,
} from "@moltin/sdk";
import { ParsedUrlQuery } from "querystring";
import { withStoreServerSideProps } from "../../lib/store-wrapper-ssr";
import { getCart } from "../../services/cart";
import { OrderSummary } from "../../components/checkout/OrderSummary";
import {
  getPresentCartStateCheckout,
  useCart,
} from "@elasticpath/react-shopper-hooks";
import CheckoutForm from "../../components/checkout/CheckoutForm";
import { globalBaseWidth } from "../../styles/theme";
import { useCallback, useState } from "react";
import { OrderCompleteState } from "../../components/checkout/types/order-pending-state";
import { PresentCartState } from "@elasticpath/react-shopper-hooks";
import { CheckoutForm as CheckoutFormType } from "../../components/checkout/form-schema/checkout-form-schema";
import OrderComplete from "../../components/cart/OrderComplete";
import StripeTypeCheckoutForm from "../../components/checkout/StripeTypeCheckoutForm";

interface ICheckout {
  cart: ResourceIncluded<Cart, CartIncluded>;
}

export const Checkout: NextPage<ICheckout> = () => {
  const { state, checkout, stripeIntent } = useCart();
  const [orderCompleteState, setOrderCompleteState] = useState<
    OrderCompleteState | undefined
  >(undefined);

  const showEpStripePaymentGateway = true;

  const showCompletedOrder = useCallback(
    function (cart: PresentCartState) {
      return (
        paymentResponse: ConfirmPaymentResponse,
        checkoutForm: CheckoutFormType
      ): void => {
        setOrderCompleteState({
          paymentResponse,
          checkoutForm,
          cart,
        });
        window.scrollTo({ top: 0, left: 0 });
      };
    },
    [setOrderCompleteState]
  );

  const presentCart = getPresentCartStateCheckout(state);

  return (
    <Box
      maxW={globalBaseWidth}
      m="0 auto"
      w="full"
      px={{ base: 8, "2xl": 0 }}
      py={10}
    >
      {orderCompleteState ? (
        <OrderComplete state={orderCompleteState} />
      ) : (
        <>
          <Heading as="h1" pb={4} size={{ base: "md", sm: "lg" }}>
            Checkout
          </Heading>
          {presentCart && (
            <Grid
              templateColumns={{ base: "auto", md: "1.7fr 1fr" }}
              templateRows={{ base: "repeat(2, auto)", md: "auto" }}
              columnGap={16}
              rowGap={8}
              mt="16px"
            >
              <GridItem
                rowStart={{ base: 2, md: 1 }}
                colStart={{ base: 1, md: 1 }}
              >
                {showEpStripePaymentGateway ? (
                  <StripeTypeCheckoutForm
                    checkout={stripeIntent}
                    showCompletedOrder={showCompletedOrder(presentCart)}
                  />
                ) : (
                  <CheckoutForm
                    checkout={checkout}
                    showCompletedOrder={showCompletedOrder(presentCart)}
                  />
                )}
              </GridItem>
              <GridItem rowStart={{ base: 1 }} colStart={{ base: 1, md: 2 }}>
                <OrderSummary
                  items={presentCart.items}
                  promotionItems={presentCart.groupedItems.promotion}
                  totalPrice={presentCart.withTax}
                  subtotal={presentCart.withoutTax}
                />
              </GridItem>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};
export default Checkout;

interface CheckoutParams extends ParsedUrlQuery {
  cartId: string;
}

export const getServerSideProps = withStoreServerSideProps<
  ICheckout,
  CheckoutParams
>(async ({ params }) => {
  const cartId = params?.cartId;

  if (!cartId) {
    return {
      notFound: true,
    };
  }

  const cart = await getCart(cartId);

  if (!cart.included || cart.included.items.length < 1) {
    return {
      redirect: {
        destination: "/cart",
        permanent: false,
      },
    };
  }

  return {
    props: {
      cart,
    },
  };
});
