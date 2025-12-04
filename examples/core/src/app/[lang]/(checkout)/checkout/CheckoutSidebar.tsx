"use client";
import { Separator } from "src/components/separator/Separator";
import { CartDiscounts } from "src/components/cart/CartDiscounts";
import * as React from "react";
import {
  ItemSidebarItems,
  ItemSidebarPromotions,
  ItemSidebarTotals,
  ItemSidebarTotalsTax,
  resolveTotalInclShipping,
} from "src/components/checkout-sidebar/ItemSidebar";
import { staticDeliveryMethods } from "./useShippingMethod";
import { cn } from "src/lib/cn";
import { useWatch } from "react-hook-form";
import { EP_CURRENCY_CODE } from "src/lib/resolve-ep-currency-code";
import { formatCurrency } from "src/lib/format-currency";
import { LoadingDots } from "src/components/LoadingDots";
import { getACart, ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { ItemSidebarHideable } from "src/components/checkout-sidebar/ItemSidebarHideable";
import { groupCartItems } from "src/lib/group-cart-items";
import { useParams } from "next/navigation";
import { getPreferredCurrency } from "src/lib/get-locale-currency";

export function CheckoutSidebar({
  cart,
  currencies,
}: {
  cart: NonNullable<Awaited<ReturnType<typeof getACart>>["data"]>;
  currencies: ResponseCurrency[];
}) {
  const shippingMethod = useWatch({ name: "shippingMethod" });

  const { lang } = useParams();
  const cartCurrencyCode = cart.data?.meta?.display_price?.with_tax?.currency;
  const storeCurrency = getPreferredCurrency(lang as string, currencies, cartCurrencyCode);

  const groupedItems = groupCartItems(cart?.included?.items ?? []);
  const { regular, promotion, itemLevelPromotion, subscription_offerings } = groupedItems;

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

  const discountedValues = cart.data?.meta?.display_price?.discount;
  const hasPromotion = discountedValues && discountedValues.amount !== 0;

  // CART TOTAL BEFORE DISCOUNTS (SALE + PROMOTIONS)
  const cartItems = cart.included?.items ?? [];
  const totalCartValue = cartItems.reduce((acc, item) => {
    const itemOriginalPrice =
      (item as any).productDetail?.meta?.original_display_price?.without_tax
        ?.amount ||
      (item as any).productDetail?.meta?.display_price?.without_tax?.amount ||
      0
    const itemQuantity = (item as any).quantity || 1;
    return acc + (itemOriginalPrice * itemQuantity)
  }, 0);
  const formattedCartTotal = totalCartValue
    ? formatCurrency(
        totalCartValue || 0,
        storeCurrency || { code: "USD", decimal_places: 2 },
      )
    : undefined

  // TOTAL SALE PRICE SAVINGS
  const totalCartValueWithoutDiscount = cartItems.reduce((acc, item) => {
    const itemWithoudDiscount =
      item?.meta?.display_price?.without_discount?.value?.amount || 0
    return acc + itemWithoudDiscount
  }, 0);
  const cartSavings = totalCartValueWithoutDiscount - totalCartValue
  const formattedCartSavings = cartSavings
    ? formatCurrency(
        cartSavings || 0,
        storeCurrency || { code: "USD", decimal_places: 2 },
      )
    : undefined
  const hasSalePricing = cartSavings !== 0

  // TOTAL CART SAVINGS
  const totalCartValueWithoutTax = cart.data?.meta?.display_price?.without_tax?.amount || 0;
  const totalCartSavings = totalCartValueWithoutTax - totalCartValue
  const formattedTotalCartSavings = totalCartSavings
    ? formatCurrency(
        totalCartSavings || 0,
        storeCurrency || { code: "USD", decimal_places: 2 },
      )
    : undefined

  return (
    <ItemSidebarHideable meta={cart.data?.meta}>
      <div className="inline-flex flex-col items-start gap-5 w-full lg:w-[24.375rem] px-5 lg:px-0">
        <ItemSidebarItems
          items={[...regular, ...subscription_offerings]}
          storeCurrency={storeCurrency}
        />
        <ItemSidebarPromotions currencyCode={storeCurrency?.code} />
        <Separator />
        <CartDiscounts
          promotions={promotion}
          itemLevelPromotion={itemLevelPromotion}
        />
        {/* Totals */}
        <ItemSidebarTotals>
          {(hasSalePricing || hasPromotion) && (
            <>
              <div className="flex justify-between items-baseline self-stretch">
                <span className="text-sm">Total before discounts</span>
                <span className="font-medium">{formattedCartTotal}</span>
              </div>
              {hasSalePricing && (
                <div className="flex text-red-600 justify-between items-baseline self-stretch">
                  <span className="text-sm">Sale markdowns</span>
                  <span className="font-medium">{formattedCartSavings}</span>
                </div>
              )}
              {hasPromotion && (
                <div className="flex text-green-600 justify-between items-baseline self-stretch">
                  <span className="text-sm">Promo savings</span>
                  <span className="font-medium">
                    {discountedValues.formatted}
                  </span>
                </div>
              )}
            </>
          )}
          <div className="flex justify-between items-baseline self-stretch">
            <span className="text-sm">Sub Total</span>
            <span className="font-medium">
              {cart.data?.meta?.display_price?.without_tax?.formatted}
            </span>
          </div>
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
        {/* TOTAL SAVINGS */}
        {(hasSalePricing || hasPromotion) && (
          <div className="flex bg-green-100 mx-auto px-2 rounded-lg font-medium text-green-600 justify-between items-baseline gap-10">
            <span>Your savings</span>
            <span>{formattedTotalCartSavings}</span>
          </div>
        )}
      </div>
    </ItemSidebarHideable>
  );
}
