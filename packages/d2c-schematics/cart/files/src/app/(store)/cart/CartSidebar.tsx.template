"use client";

import { useCart } from "@elasticpath/react-shopper-hooks";
import { Separator } from "../../../components/separator/Separator";
import { CartDiscounts } from "../../../components/cart/CartDiscounts";
import * as React from "react";
import {
  ItemSidebarPromotions,
  ItemSidebarSumTotal,
  ItemSidebarTotals,
  ItemSidebarTotalsDiscount,
  ItemSidebarTotalsSubTotal,
  ItemSidebarTotalsTax,
} from "../../../components/checkout-sidebar/ItemSidebar";

export function CartSidebar() {
  const { data } = useCart();

  const state = data?.state;

  if (!state) {
    return null;
  }

  const { meta } = state;

  return (
    <div className="inline-flex flex-col items-start gap-5 lg:w-[24.375rem] w-full">
      <ItemSidebarPromotions />
      <Separator />
      <CartDiscounts promotions={state.__extended.groupedItems.promotion} />
      {/* Totals */}
      <ItemSidebarTotals>
        <ItemSidebarTotalsSubTotal meta={meta} />
        <div className="flex justify-between items-baseline self-stretch">
          <span className="text-sm">Shipping</span>
          <span className="text-black/60">Calculated at checkout</span>
        </div>
        <ItemSidebarTotalsDiscount meta={meta} />
        <ItemSidebarTotalsTax meta={meta} />
      </ItemSidebarTotals>
      <Separator />
      {/* Sum Total */}
      <ItemSidebarSumTotal meta={meta} />
    </div>
  );
}
