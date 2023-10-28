"use client";
import Cart from "../../components/cart/Cart";
import CartIcon from "../../components/icons/cart";
import { useCart } from "@elasticpath/react-shopper-hooks";
import { resolveShoppingCartProps } from "../../lib/resolve-shopping-cart-props";
import Link from "next/link";

export default function CartPage() {
  const { removeCartItem, state } = useCart();
  const shoppingCartProps = resolveShoppingCartProps(state, removeCartItem);

  return (
    <div className="m-auto w-full max-w-base-max-width px-6 py-10 2xl:px-0">
      {shoppingCartProps && (
        <>
          <h1 className="pb-5 text-3xl font-bold">Your Shopping Cart</h1>
          <Cart {...shoppingCartProps} />
        </>
      )}
      {(state.kind === "empty-cart-state" ||
        state.kind === "uninitialised-cart-state" ||
        state.kind === "loading-cart-state") && (
        <div className="text-center min-h-64">
          <CartIcon className="mx-auto h-24" />
          <h3 className="mt-4 text-sm font-semibold text-gray-900">
            Empty Cart
          </h3>
          <p className="mt-1 text-sm text-gray-500">Your cart is empty</p>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center rounded-md bg-brand-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-highlight focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-highlight"
              type="button"
            >
              Start shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
