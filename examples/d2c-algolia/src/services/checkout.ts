import type { Order, ConfirmPaymentBody } from "@moltin/sdk";
import { EPCCAPI } from "./helper";

export async function checkout(
  reference: string,
  customer: any,
  billing: any,
  shipping: any
): Promise<{ data: Order }> {
  const checkoutRes = await EPCCAPI.Cart(reference).Checkout(
    customer,
    billing,
    shipping
  );

  return checkoutRes;
}

export async function payment(payment: ConfirmPaymentBody, orderId: string) {
  await EPCCAPI.Orders.Payment(orderId, payment);
}

export async function removeAllCartItems(reference: string): Promise<void> {
  await EPCCAPI.Cart(reference).RemoveAllItems();
}
