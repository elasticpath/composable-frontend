"use client";

import { forwardRef, Fragment, HTMLAttributes } from "react";
import { Separator } from "../separator/Separator";
import {
  PromotionCartItem,
  useCartRemoveItem,
} from "@elasticpath/react-shopper-hooks";
import { LoadingDots } from "../LoadingDots";
import { XMarkIcon } from "@heroicons/react/24/solid";
import * as React from "react";
import { cn } from "../../lib/cn";

export function CartDiscounts({
  promotions,
}: {
  promotions: PromotionCartItem[];
}) {
  const { mutate, isPending } = useCartRemoveItem();

  return (
    promotions &&
    promotions.length > 0 &&
    promotions.map((promotion) => {
      return (
        <Fragment key={promotion.id}>
          <CartDiscountItem key={promotion.id}>
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
            <CartDiscountName>{promotion.name}</CartDiscountName>
          </CartDiscountItem>
          <Separator />
        </Fragment>
      );
    })
  );
}

export function CartDiscountsReadOnly({
  promotions,
}: {
  promotions: PromotionCartItem[];
}) {
  return (
    promotions &&
    promotions.length > 0 &&
    promotions.map((promotion) => {
      return (
        <Fragment key={promotion.id}>
          <CartDiscountItem key={promotion.id}>
            <CartDiscountName>{promotion.name}</CartDiscountName>
          </CartDiscountItem>
          <Separator />
        </Fragment>
      );
    })
  );
}

const CartDiscountItem = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      {...props}
      className={cn("flex flex-col items-start gap-2 self-stretch", className)}
    >
      <div className="flex flex-row gap-2">{children}</div>
    </div>
  );
});
CartDiscountItem.displayName = "CartDiscountItem";

const CartDiscountName = forwardRef<
  HTMLSpanElement,
  HTMLAttributes<HTMLSpanElement>
>(({ className, children, ...props }, ref) => {
  return (
    <span ref={ref} {...props}>
      {children}
    </span>
  );
});
CartDiscountName.displayName = "CartDiscountName";
