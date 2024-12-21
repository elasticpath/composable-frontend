"use client";
import { Separator } from "../../../components/separator/Separator";
import { CartDiscountsReadOnly } from "../../../components/cart/CartDiscounts";
import * as React from "react";
import {
  groupCartItems,
  useCurrencies,
} from "@elasticpath/react-shopper-hooks";
import {
  ItemSidebarHideable,
  ItemSidebarItems,
  ItemSidebarTotals,
  ItemSidebarTotalsDiscount,
  ItemSidebarTotalsSubTotal,
  ItemSidebarTotalsTax,
  resolveTotalInclShipping,
} from "../../../components/checkout-sidebar/ItemSidebar";
import { useCheckout } from "./checkout-provider";
import { staticDeliveryMethods } from "./useShippingMethod";
import { EP_CURRENCY_CODE } from "../../../lib/resolve-ep-currency-code";
import { LoadingDots } from "../../../components/LoadingDots";

export function ConfirmationSidebar() {
  const { confirmationData } = useCheckout();

  const { data: currencyData } = useCurrencies();

  if (!confirmationData) {
    return null;
  }

  const { order, cart } = confirmationData;

  const groupedItems = groupCartItems(cart.data);

  const shippingMethodCustomItem = groupedItems.custom.find((item) =>
    item.sku.startsWith("__shipping_"),
  );

  const meta = {
    display_price: order.data.meta.display_price,
  };

  const shippingAmount = staticDeliveryMethods.find(
    (method) =>
      !!shippingMethodCustomItem &&
      method.value === shippingMethodCustomItem.sku,
  )?.amount;

  const storeCurrency = currencyData?.find(
    (currency) => currency.code === EP_CURRENCY_CODE,
  );

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
        <div className="flex flex-col gap-5">
          <ItemSidebarItems items={groupedItems.regular} />
        </div>
        <span className="text-sm text-black/60">Discounts applied</span>
        <CartDiscountsReadOnly promotions={groupedItems.promotion} />
        {/* Totals */}
        <ItemSidebarTotals>
          <ItemSidebarTotalsSubTotal meta={meta} />
          {shippingMethodCustomItem && (
            <div className="flex justify-between items-baseline self-stretch">
              <span className="text-sm">Shipping</span>
              <span className="font-medium">
                {
                  shippingMethodCustomItem.meta.display_price.with_tax.value
                    .formatted
                }
              </span>
            </div>
          )}
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
