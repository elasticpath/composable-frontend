"use client";
import { Separator } from "../../../components/separator/Separator";
import { CartDiscounts } from "../../../components/cart/CartDiscounts";
import * as React from "react";
import {
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
import { getCart, ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { ItemSidebarHideable } from "../../../components/checkout-sidebar/ItemSidebarHideable";
import { groupCartItems } from "../../../lib/group-cart-items";

export function CheckoutSidebar({
  cart,
  currencies,
}: {
  cart: NonNullable<Awaited<ReturnType<typeof getCart>>["data"]>;
  currencies: ResponseCurrency[];
}) {
  const shippingMethod = useWatch({ name: "shippingMethod" });

  const storeCurrency = currencies?.find(
    (currency) => currency.code === EP_CURRENCY_CODE,
  );

  const groupedItems = groupCartItems(cart?.included?.items ?? []);
  const { regular, promotion, subscription_offerings } = groupedItems;

  const shippingAmount = staticDeliveryMethods.find(
    (method) => method.value === shippingMethod,
  )?.amount;

  const formattedTotalAmountInclShipping =
    cart.data?.meta?.display_price?.with_tax?.amount !== undefined &&
    shippingAmount !== undefined &&
    storeCurrency
      ? resolveTotalInclShipping(
          shippingAmount,
          cart.data?.meta.display_price.with_tax.amount,
          storeCurrency,
        )
      : undefined;

  return (
    <ItemSidebarHideable meta={cart.data?.meta}>
      <div className="inline-flex flex-col items-start gap-5 w-full lg:w-[24.375rem] px-5 lg:px-0">
        <ItemSidebarItems items={[...regular, ...subscription_offerings]} />
        <ItemSidebarPromotions />
        <Separator />
        <CartDiscounts promotions={promotion} />
        {/* Totals */}
        <ItemSidebarTotals>
          <ItemSidebarTotalsSubTotal meta={cart.data?.meta} />
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
          <ItemSidebarTotalsDiscount meta={cart.data?.meta} />
          <ItemSidebarTotalsTax meta={cart.data?.meta} />
        </ItemSidebarTotals>
        <Separator />
        {/* Sum total incl shipping */}
        {formattedTotalAmountInclShipping ? (
          <div className="flex justify-between items-baseline self-stretch">
            <span>Total</span>
            <div className="flex items-center gap-2.5">
              <span>{cart.data?.meta?.display_price?.with_tax?.currency}</span>
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
