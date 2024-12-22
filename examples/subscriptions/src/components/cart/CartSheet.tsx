"use client";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../sheet/Sheet";
import { Button } from "../button/Button";
import { LockClosedIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { CartItem } from "../../app/(store)/cart/CartItem";
import { useCart, useCartRemoveItem } from "@elasticpath/react-shopper-hooks";
import { Separator } from "../separator/Separator";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { AddPromotion } from "../checkout-sidebar/AddPromotion";
import Link from "next/link";
import { LoadingDots } from "../LoadingDots";

export function Cart() {
  const { data } = useCart();

  const state = data?.state;

  const { items, __extended } = state ?? {};

  const { mutate, isPending } = useCartRemoveItem();

  const discountedValues = (
    state?.meta?.display_price as
      | { discount: { amount: number; formatted: string } }
      | undefined
  )?.discount;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="rounded-md px-4 py-2 transition-all duration-200 hover:bg-slate-200/70 relative text-sm font-medium text-black hover:underline focus:text-brand-primary active:text-brand-primary">
          <span>
            {state?.items && state.items.length > 0 && (
              <span
                className={`${
                  state?.items ? "flex" : "hidden"
                } absolute right-0 top-0 h-5 w-5 items-center justify-center rounded-full bg-brand-primary p-[0.1rem] text-[0.6rem] text-white`}
              >
                {state?.items?.length}
              </span>
            )}
            <ShoppingBagIcon className="h-6 w-6" />
          </span>
        </button>
      </SheetTrigger>
      <SheetContent className="bg-white p-0 flex flex-col w-full">
        <SheetHeader className="border-b border-black/10">
          <div></div>
          <SheetTitle tabIndex={0} className="uppercase text-sm font-medium">
            Your Bag
          </SheetTitle>
          <SheetClose className="ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <XMarkIcon className="h-6 w-6" />
            <span className="sr-only">Close</span>
          </SheetClose>
        </SheetHeader>
        {items && items.length > 0 ? (
          <>
            {/* Items */}
            <div className="grid gap-4 p-5 flex-1 overflow-auto">
              <ul
                role="list"
                className="flex flex-col items-start gap-5 self-stretch"
              >
                {items.map((item) => {
                  return (
                    <Fragment key={item.id}>
                      <li key={item.id} className="self-stretch">
                        <CartItem item={item} />
                      </li>
                      <Separator />
                    </Fragment>
                  );
                })}
              </ul>
            </div>
            {/* Bottom */}
            <SheetFooter className="flex flex-col sm:flex-col items-center gap-5 px-5 pb-5">
              <div className="flex flex-col self-stretch">
                <AddPromotion />
              </div>
              {__extended &&
                __extended.groupedItems.promotion.length > 0 &&
                __extended.groupedItems.promotion.map((promotion) => {
                  return (
                    <Fragment key={promotion.id}>
                      <Separator />
                      <div
                        key={promotion.id}
                        className="flex flex-col items-start gap-2 self-stretch"
                      >
                        <div className="flex flex-row gap-2">
                          <button
                            type="button"
                            disabled={isPending}
                            className="flex items-center"
                            onClick={() => mutate({ itemId: promotion.id })}
                          >
                            {isPending ? (
                              <LoadingDots className="bg-black" />
                            ) : (
                              <XMarkIcon className="h-3 w-3" />
                            )}
                          </button>
                          <span>{promotion.name}</span>
                        </div>
                      </div>
                    </Fragment>
                  );
                })}
              <Separator />
              {/* Totals */}
              <div className="flex flex-col items-start gap-2 w-full">
                <div className="flex justify-between items-baseline self-stretch">
                  <span>Sub Total</span>
                  <span className="font-medium text-lg">
                    {state?.meta?.display_price?.without_tax?.formatted}
                  </span>
                </div>
                {discountedValues && discountedValues.amount !== 0 && (
                  <div className="flex justify-between items-baseline self-stretch">
                    <span>Discount</span>
                    <span className="font-medium text-lg text-red-600">
                      {discountedValues.formatted}
                    </span>
                  </div>
                )}
              </div>
              <Separator />
              <SheetClose asChild>
                <Button type="button" asChild className="self-stretch">
                  <Link href="/checkout">
                    <LockClosedIcon className="w-5 h-5 mr-2" />
                    Checkout
                  </Link>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  asChild
                  className="self-stretch"
                >
                  <Link href="/cart">Go to bag</Link>
                </Button>
              </SheetClose>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-col items-center gap-5 py-20">
            <ShoppingBagIcon className="h-20 w-20" />
            <p className="font-medium text-lg">Your bag is empty.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
