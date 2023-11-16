import { Metadata } from "next";
import { getServerSideImplicitClient } from "../../../lib/epcc-server-side-implicit-client";
import { notFound } from "next/navigation";
import { CartDisplay } from "./cart-display";
import { getCart } from "../../../services/cart";

type Props = {
  params: { cartId: string };
};
export const metadata: Metadata = {
  title: "Checkout",
  description: "Checkout page",
};
export default async function CartPage({ params }: Props) {
  const { cartId } = params;

  if (!cartId) {
    notFound();
  }
  const client = getServerSideImplicitClient();
  const cart = await getCart(cartId, client);

  if (!cart) {
    notFound();
  }

  return <CartDisplay cart={cart} />;
}
