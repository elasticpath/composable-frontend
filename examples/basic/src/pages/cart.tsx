import type { NextPage } from "next";
import Image from "next/image";
import { withStoreServerSideProps } from "../lib/store-wrapper-ssr";
import { useCart } from "@elasticpath/react-shopper-hooks";
import Cart from "../components/cart/Cart";
import { resolveShoppingCartProps } from "../lib/resolve-shopping-cart-props";

export const CartPage: NextPage = () => {
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
        <>
          <h2 className="p-6 pl-0 text-3xl font-bold">Your cart is empty</h2>
          <div className="p-16">
            <Image alt="" src="/icons/empty.svg" width={488} height={461} />
          </div>
        </>
      )}
    </div>
  );
};
export default CartPage;

export const getServerSideProps = withStoreServerSideProps();
