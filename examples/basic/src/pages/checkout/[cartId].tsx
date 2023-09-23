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
import { useCallback, useState } from "react";
import { OrderCompleteState } from "../../components/checkout/types/order-pending-state";
import { PresentCartState } from "@elasticpath/react-shopper-hooks";
import { CheckoutForm as CheckoutFormType } from "../../components/checkout/form-schema/checkout-form-schema";
import OrderComplete from "../../components/checkout/OrderComplete";
import CheckoutForm from "../../components/checkout/payments/CheckoutForm";

interface ICheckout {
  cart: ResourceIncluded<Cart, CartIncluded>;
}

export const Checkout: NextPage<ICheckout> = () => {
  const { state } = useCart();
  const [orderCompleteState, setOrderCompleteState] = useState<
    OrderCompleteState | undefined
  >(undefined);

  const showCompletedOrder = useCallback(
    function (cart: PresentCartState) {
      return (
        paymentResponse: ConfirmPaymentResponse,
        checkoutForm: CheckoutFormType,
      ): void => {
        setOrderCompleteState({
          paymentResponse,
          checkoutForm,
          cart,
        });
        window.scrollTo({ top: 0, left: 0 });
      };
    },
    [setOrderCompleteState],
  );

  const presentCart = getPresentCartStateCheckout(state);

  return (
    <div className="m-auto w-full max-w-base-max-width px-8 py-10 2xl:px-0">
      {orderCompleteState ? (
        <OrderComplete state={orderCompleteState} />
      ) : (
        <>
          <h1 className="pb-5 text-3xl font-bold">Checkout</h1>
          {presentCart && (
            <div className="mt-4 flex flex-col-reverse justify-between gap-8 md:flex-row">
              <div>
                <CheckoutForm
                  showCompletedOrder={showCompletedOrder(presentCart)}
                />
              </div>
              <div className="">
                <OrderSummary
                  items={presentCart.items}
                  promotionItems={presentCart.groupedItems.promotion}
                  totalPrice={presentCart.withTax}
                  subtotal={presentCart.withoutTax}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
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
