import {
  useAddCustomItemToCart,
  useCheckout as useCheckoutCart,
  useCheckoutWithAccount,
  usePayments,
} from "@elasticpath/react-shopper-hooks";
import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { CheckoutForm } from "../../../components/checkout/form-schema/checkout-form-schema";
import { staticDeliveryMethods } from "./useShippingMethod";
import {
  CartItemsResponse,
  ConfirmPaymentResponse,
  Order,
  Resource,
} from "@elasticpath/js-sdk";

export type UsePaymentCompleteProps = {
  cartId: string | undefined;
  accountToken?: string;
};

export type UsePaymentCompleteReq = {
  data: CheckoutForm;
};

export function usePaymentComplete(
  { cartId, accountToken }: UsePaymentCompleteProps,
  options?: UseMutationOptions<
    {
      order: Resource<Order>;
      payment: ConfirmPaymentResponse;
      cart: CartItemsResponse;
    },
    unknown,
    UsePaymentCompleteReq
  >,
) {
  const { mutateAsync: mutatePayment } = usePayments();
  const { mutateAsync: mutateConvertToOrder } = useCheckoutCart(cartId ?? "");
  const { mutateAsync: mutateConvertToOrderAsAccount } = useCheckoutWithAccount(
    cartId ?? "",
  );
  const { mutateAsync: mutateAddCustomItemToCart } = useAddCustomItemToCart(
    cartId ?? "",
  );

  const paymentComplete = useMutation({
    mutationFn: async ({ data }) => {
      const {
        shippingAddress,
        billingAddress,
        sameAsShipping,
        shippingMethod,
      } = data;

      const customerName = `${shippingAddress.first_name} ${shippingAddress.last_name}`;

      const checkoutProps = {
        billingAddress:
          billingAddress && !sameAsShipping ? billingAddress : shippingAddress,
        shippingAddress: shippingAddress,
      };

      /**
       * The handling of shipping options is not production ready.
       * You must implement your own based on your business needs.
       */
      const shippingAmount =
        staticDeliveryMethods.find((method) => method.value === shippingMethod)
          ?.amount ?? 0;

      /**
       * Using a cart custom_item to represent shipping for demo purposes.
       */
      const cartInclShipping = await mutateAddCustomItemToCart({
        type: "custom_item",
        name: "Shipping",
        sku: shippingMethod,
        quantity: 1,
        price: {
          amount: shippingAmount,
          includes_tax: true,
        },
      });

      /**
       * 1. Convert our cart to an order we can pay
       */
      const createdOrder = await ("guest" in data
        ? mutateConvertToOrder({
            customer: {
              email: data.guest.email,
              name: customerName,
            },
            ...checkoutProps,
          })
        : mutateConvertToOrderAsAccount({
            contact: {
              name: data.account.name,
              email: data.account.email,
            },
            token: accountToken ?? "",
            ...checkoutProps,
          }));

      /**
       * 2. Perform payment against the order
       */
      const confirmedPayment = await mutatePayment({
        orderId: createdOrder.data.id,
        payment: {
          gateway: "manual",
          method: "purchase",
        },
      });

      return {
        order: createdOrder,
        payment: confirmedPayment,
        cart: cartInclShipping,
      };
    },
    ...options,
  });

  return {
    ...paymentComplete,
  };
}
