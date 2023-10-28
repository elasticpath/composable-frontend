import type {
  Order,
  PaymentRequestBody,
  Address,
  CheckoutCustomerObject,
  Moltin as EPCCClient,
  ConfirmPaymentResponse,
} from "@moltin/sdk";

export function checkout(
  id: string,
  customer: CheckoutCustomerObject,
  billing: Partial<Address>,
  shipping: Partial<Address>,
  client: EPCCClient,
): Promise<{ data: Order }> {
  return client.Cart(id).Checkout(customer, billing, shipping);
}

export function makePayment(
  payment: PaymentRequestBody,
  orderId: string,
  client: EPCCClient,
): Promise<ConfirmPaymentResponse> {
  return client.Orders.Payment(orderId, payment);
}

export function confirmOrder(
  orderId: string,
  transactionId: string,
  client: EPCCClient,
): Promise<ConfirmPaymentResponse> {
  return client.Orders.Confirm(orderId, transactionId, { data: {} });
}
