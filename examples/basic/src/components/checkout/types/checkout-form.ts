import { ConfirmPaymentResponse } from "@moltin/sdk";
import { CheckoutForm as CheckoutFormType } from "../form-schema/checkout-form-schema";

export interface ICheckoutForm {
  showCompletedOrder: (
    paymentResponse: ConfirmPaymentResponse,
    checkoutForm: CheckoutFormType,
  ) => void;
}

export type CheckoutFormComponent = (props: ICheckoutForm) => JSX.Element;
