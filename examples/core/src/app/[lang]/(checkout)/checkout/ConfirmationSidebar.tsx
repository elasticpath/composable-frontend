"use client";
import { Separator } from "src/components/separator/Separator";
import { CartDiscountsReadOnly } from "src/components/cart/CartDiscounts";
import * as React from "react";
import {
  ItemSidebarItems,
  ItemSidebarTotals,
  ItemSidebarTotalsDiscount,
  ItemSidebarTotalsSubTotal,
  ItemSidebarTotalsTax,
  resolveTotalInclShipping,
} from "src/components/checkout-sidebar/ItemSidebar";
import { staticDeliveryMethods } from "./useShippingMethod";
import { LoadingDots } from "src/components/LoadingDots";
import { ItemSidebarHideable } from "src/components/checkout-sidebar/ItemSidebarHideable";
import { groupCartItems } from "src/lib/group-cart-items";
import { ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { useOrderConfirmation } from "./OrderConfirmationProvider";
import { getPreferredCurrency } from "src/lib/i18n";

export function ConfirmationSidebar({
  currencies,
  lang,
}: {
  currencies: ResponseCurrency[];
  lang: string;
}) {
  const confirmationData = useOrderConfirmation();

  if (!confirmationData) {
    return null;
  }

  const { order, cart } = confirmationData;

  const groupedItems = groupCartItems(cart);

  const shippingMethodCustomItem = groupedItems.custom.find(
    (item) => item.sku?.startsWith("__shipping_"),
  );

  const shippingAmount = staticDeliveryMethods.find(
    (method) =>
      !!shippingMethodCustomItem &&
      method.value === shippingMethodCustomItem.sku,
  )?.amount;

  const orderCurrencyCode = order.meta?.display_price?.with_tax?.currency;
  const storeCurrency = getPreferredCurrency(lang as string, currencies, orderCurrencyCode);

  const formattedTotalAmountInclShipping =
    order.meta?.display_price?.with_tax?.amount !== undefined &&
    shippingAmount !== undefined &&
    storeCurrency
      ? resolveTotalInclShipping(
          shippingAmount,
          order.meta?.display_price?.with_tax.amount,
          storeCurrency,
        )
      : undefined;

  return (
    <ItemSidebarHideable meta={order.meta}>
      <div className="inline-flex flex-col items-start gap-5 w-full lg:w-[24.375rem] px-5 lg:px-0">
        <div className="flex flex-col gap-5">
          <ItemSidebarItems items={groupedItems.regular} />
        </div>
        <span className="text-sm text-black/60">Discounts applied</span>
        <CartDiscountsReadOnly promotions={groupedItems.promotion} />
        {/* Totals */}
        <ItemSidebarTotals>
          <ItemSidebarTotalsSubTotal meta={order.meta} />
          {shippingMethodCustomItem && (
            <div className="flex justify-between items-baseline self-stretch">
              <span className="text-sm">Shipping</span>
              <span className="font-medium">
                {
                  shippingMethodCustomItem.meta?.display_price?.with_tax?.value
                    ?.formatted
                }
              </span>
            </div>
          )}
          <ItemSidebarTotalsDiscount meta={order.meta} />
          <ItemSidebarTotalsTax meta={order.meta} />
        </ItemSidebarTotals>
        <Separator />
        {/* Sum total incl shipping */}
        {formattedTotalAmountInclShipping ? (
          <div className="flex justify-between items-baseline self-stretch">
            <span>Total</span>
            <div className="flex items-center gap-2.5">
              <span>{order.meta?.display_price?.with_tax?.currency}</span>
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
