"use client";

import { forwardRef, Fragment, HTMLAttributes } from "react";
import { Separator } from "../separator/Separator";
import * as React from "react";
import { cn } from "../../lib/cn";
import { RemoveCartItemXButton } from "./RemoveCartItemXButton";
import { GroupedCartItems } from "../../lib/group-cart-items";

export function CartDiscounts({
  promotions,
}: {
  promotions: GroupedCartItems["promotion"];
}) {
  return (
    promotions &&
    promotions.length > 0 &&
    promotions.map((promotion) => {
      return (
        <Fragment key={promotion.id}>
          <CartDiscountItem key={promotion.id}>
            <RemoveCartItemXButton cartItemId={promotion.id!} />
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
  promotions: GroupedCartItems["promotion"];
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
>(({ children, ...props }, ref) => {
  return (
    <span ref={ref} {...props}>
      {children}
    </span>
  );
});
CartDiscountName.displayName = "CartDiscountName";
