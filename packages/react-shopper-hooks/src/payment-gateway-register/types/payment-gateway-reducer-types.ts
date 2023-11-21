import { PaymentRequestBody } from "@moltin/sdk";

/** --------------------------------- Payment Gateway Register (PGR) State --------------------------------- */

interface PaymentGatewayStateBase {}

/**
 * State the PGR is in when no gateways have been registered
 */
export interface UninitializedPGRState extends PaymentGatewayStateBase {
  readonly kind: "uninitialized-payment-gateway-register-state";
}

export type SupportedGateway = "braintree" | "manual";

export type ResolvePaymentFunction = RegisteredPGRState["resolvePayment"];

/**
 * State the PGR is in when a payment gateway has been registered and is ready to process payments
 */
export interface RegisteredPGRState extends PaymentGatewayStateBase {
  readonly kind: "registered-payment-gateway-register-state";

  /**
   * the type of payment gateway that has been registered
   */
  readonly type: SupportedGateway;

  /**
   * this function when called will resolve the payment specification for the registered gateway
   */
  readonly resolvePayment: () =>
    | Promise<PaymentRequestBody>
    | PaymentRequestBody;
}

/**
 * Representing a state the PGR can be in.
 */
export type PGRState = UninitializedPGRState | RegisteredPGRState;

/** --------------------------------- Payment Gateway Register (PGR) Actions --------------------------------- */

/**
 * Register the cart with updated items and meta
 */
export interface UpdatePGRAction {
  type: "update-payment-gateway-register";
  payload: {
    type: SupportedGateway;
    resolvePayment: ResolvePaymentFunction;
  };
}

/**
 * Actions that can be performed to change the state of the cart
 */
export type PGRAction = UpdatePGRAction;
