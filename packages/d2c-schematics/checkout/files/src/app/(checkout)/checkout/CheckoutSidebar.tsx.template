"use client";
import { Separator } from "../../../components/separator/Separator";
import { CartDiscounts } from "../../../components/cart/CartDiscounts";
import * as React from "react";
import { useCart, useCurrencies } from "@elasticpath/react-shopper-hooks";
import {
  ItemSidebarHideable,
  ItemSidebarItems,
  ItemSidebarPromotions,
  ItemSidebarTotals,
  ItemSidebarTotalsDiscount,
  ItemSidebarTotalsSubTotal,
  ItemSidebarTotalsTax,
  resolveTotalInclShipping,
} from "../../../components/checkout-sidebar/ItemSidebar";
import { staticDeliveryMethods } from "./useShippingMethod";
import { cn } from "../../../lib/cn";
import { useWatch } from "react-hook-form";
import { EP_CURRENCY_CODE } from "../../../lib/resolve-ep-currency-code";
import { formatCurrency } from "../../../lib/format-currency";
import { LoadingDots } from "../../../components/LoadingDots";

export function CheckoutSidebar() {
  const { data } = useCart();
  const state = data?.state;
  const shippingMethod = useWatch({ name: "shippingMethod" });

  const { data: currencyData } = useCurrencies();

  const storeCurrency = currencyData?.find(
    (currency) => currency.code === EP_CURRENCY_CODE,
  );

  if (!state) {
    return null;
  }

  const shippingAmount = staticDeliveryMethods.find(
    (method) => method.value === shippingMethod,
  )?.amount;

  const { meta, __extended } = state;

  const formattedTotalAmountInclShipping =
    meta?.display_price?.with_tax?.amount !== undefined &&
    shippingAmount !== undefined &&
    storeCurrency
      ? resolveTotalInclShipping(
          shippingAmount,
          meta.display_price.with_tax.amount,
          storeCurrency,
        )
      : undefined;

  return (
    <ItemSidebarHideable meta={meta}>
      <div className="inline-flex flex-col items-start gap-5 w-full lg:w-[24.375rem] px-5 lg:px-0">
        <ItemSidebarItems items={__extended.groupedItems.regular} />
        <ItemSidebarPromotions />
        <Separator />
        <CartDiscounts promotions={state.__extended.groupedItems.promotion} />
        {/* Totals */}
        <ItemSidebarTotals>
          <ItemSidebarTotalsSubTotal meta={meta} />
          <div className="flex justify-between items-baseline self-stretch">
            <span className="text-sm">Shipping</span>
            <span
              className={cn(
                "font-medium",
                shippingAmount === undefined && "font-normal text-black/60",
              )}
            >
              {shippingAmount === undefined ? (
                "Select delivery method"
              ) : storeCurrency ? (
                formatCurrency(shippingAmount, storeCurrency)
              ) : (
                <LoadingDots className="h-2 bg-black" />
              )}
            </span>
          </div>
          <ItemSidebarTotalsDiscount meta={meta} />
          <ItemSidebarTotalsTax meta={meta} />
        </ItemSidebarTotals>
        <Separator />
        {/* Sum total incl shipping */}
        {formattedTotalAmountInclShipping ? (
          <div className="flex justify-between items-baseline self-stretch">
            <span>Total</span>
            <div className="flex items-center gap-2.5">
              <span>{meta?.display_price?.with_tax?.currency}</span>
              <span className="font-medium text-2xl">
                {formattedTotalAmountInclShipping}
              </span>
            </div>
          </div>
        ) : (
          <LoadingDots className="h-2 bg-black" />
        )}
      </div>
    </ItemSidebarHideable>
  );
}
