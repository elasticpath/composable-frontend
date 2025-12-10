import { Separator } from "src/components/separator/Separator";
import { CartDiscounts } from "src/components/cart/CartDiscounts";
import * as React from "react";
import {
  ItemSidebarPromotions,
  ItemSidebarSumTotal,
  ItemSidebarTotals,
  ItemSidebarTotalsTax,
} from "src/components/checkout-sidebar/ItemSidebar";
import { getACart, ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { groupCartItems } from "src/lib/group-cart-items";
import { formatCurrency } from "src/lib/format-currency";

export function CartSidebar({
  cart,
  storeCurrency,
}: {
  cart: NonNullable<Awaited<ReturnType<typeof getACart>>["data"]>;
  storeCurrency: ResponseCurrency | undefined;
}) {
  const meta = cart.data?.meta!;
  const groupedItems = groupCartItems(cart.included?.items ?? []);

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
    <div className="inline-flex flex-col items-start gap-5 lg:w-[24.375rem] w-full">
      <ItemSidebarPromotions currencyCode={storeCurrency?.code} />
      <Separator />
      <CartDiscounts promotions={groupedItems.promotion} />
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
          <span className="text-black/60">Calculated at checkout</span>
        </div>
        <ItemSidebarTotalsTax meta={cart.data?.meta} />
      </ItemSidebarTotals>
      <Separator />
      {/* Sum Total */}
      <ItemSidebarSumTotal meta={meta} />
      {/* Total Savings */}
      {(hasSalePricing || hasPromotion) && (
        <div className="flex bg-green-100 mx-auto px-2 rounded-lg font-medium text-green-600 justify-between items-baseline gap-10">
          <span>Your savings</span>
          <span>{formattedTotalCartSavings}</span>
        </div>
      )}
    </div>
  );
}
