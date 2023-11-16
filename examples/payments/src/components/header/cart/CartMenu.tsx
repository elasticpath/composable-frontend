"use client";
import Link from "next/link";
import ModalCartItems from "./ModalCartItem";
import {
  CartState,
  getPresentCartState,
  RefinedCartItem,
  useCart,
} from "@elasticpath/react-shopper-hooks";
import { Popover, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { ReadonlyNonEmptyArray } from "@elasticpath/react-shopper-hooks";

export default function CartMenu(): JSX.Element {
  const { state } = useCart();

  const stateItems = resolveStateCartItems(state);

  function resolveStateCartItems(
    state: CartState,
  ): ReadonlyNonEmptyArray<RefinedCartItem> | undefined {
    const presentCartState = getPresentCartState(state);
    return presentCartState && presentCartState.items;
  }

  return (
    <div>
      {/* Headless */}
      <Popover className="relative">
        {({ close }) => (
          <>
            <Popover.Button className="nav-button-container relative text-sm font-medium text-black hover:underline focus:text-brand-primary active:text-brand-primary">
              <span
                className={`${
                  stateItems ? "flex" : "hidden"
                } absolute right-0 top-0 h-5 w-5 items-center justify-center rounded-full bg-brand-primary p-[0.1rem] text-[0.6rem] text-white`}
              >
                {stateItems?.length}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </Popover.Button>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute right-0 z-10 mt-8 w-72 transform text-sm sm:px-0">
                <div className="z-60 overflow-hidden rounded-md border bg-white shadow-lg">
                  <div className="h-80 overflow-y-auto p-4 ">
                    <ModalCartItems onClose={close} />
                  </div>
                  <hr className="my-4"></hr>
                  <div className="p-4 pt-0">
                    <CartPopoverFooter state={state} onClose={close} />
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
}

function CartPopoverFooter({
  state,
  onClose,
}: {
  state: CartState;
  onClose: () => void;
}): JSX.Element {
  const checkoutHref =
    state.kind === "present-cart-state" ? `/checkout/${state.id}` : "#";
  const hasCartItems = state.kind === "present-cart-state";
  return (
    <div>
      <Link href={checkoutHref} passHref legacyBehavior>
        <button
          className="primary-btn"
          disabled={!hasCartItems}
          onClick={() => onClose()}
        >
          Checkout
        </button>
      </Link>
      <Link href="/cart" passHref legacyBehavior>
        <button
          className="secondary-btn mt-3 bg-transparent text-black"
          onClick={() => onClose()}
        >
          View cart
        </button>
      </Link>
    </div>
  );
}
