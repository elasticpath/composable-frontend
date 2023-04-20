import type {
  Order,
  PaymentRequestBody,
  Address,
  CheckoutCustomerObject,
  Moltin as EPCCClient,
  ConfirmPaymentResponse,
} from "@moltin/sdk";
import { getEpccImplicitClient } from "../lib/epcc-implicit-client";

export function checkout(
  id: string,
  customer: CheckoutCustomerObject,
  billing: Partial<Address>,
  shipping: Partial<Address>,
  client?: EPCCClient
): Promise<{ data: Order }> {
  return (client ?? getEpccImplicitClient())
    .Cart(id)
    .Checkout(customer, billing, shipping);
}

export function makePayment(
  payment: PaymentRequestBody,
  orderId: string,
  client?: EPCCClient
): Promise<ConfirmPaymentResponse> {
  return (client ?? getEpccImplicitClient()).Orders.Payment(orderId, payment);
}

export function confirmOrder(
  orderId: string,
  transactionId: string,
  client?: EPCCClient
): Promise<ConfirmPaymentResponse> {
  return (client ?? getEpccImplicitClient()).Orders.Confirm(
    orderId,
    transactionId,
    { data: {} }
  );
}
