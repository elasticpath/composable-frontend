import { PresentCartState } from "@elasticpath/react-shopper-hooks";
import { CheckoutForm as CheckoutFormType } from "../form-schema/checkout-form-schema";
import { ConfirmPaymentResponse } from "@moltin/sdk";

export type OrderCompleteState = {
  paymentResponse: ConfirmPaymentResponse;
  cart: PresentCartState;
  checkoutForm: CheckoutFormType;
};
