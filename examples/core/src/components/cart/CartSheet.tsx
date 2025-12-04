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
import { CartItem } from "../../app/[lang]/(store)/cart/CartItem";
import { Separator } from "../separator/Separator";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { Fragment } from "react";
import { AddPromotion } from "../checkout-sidebar/AddPromotion";
import { LocaleLink } from "../LocaleLink";
import { getACart, ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { groupCartItems } from "../../lib/group-cart-items";
import { RemoveCartPromotionXButton } from "./RemoveCartPromotionXButton";
import { formatCurrency } from "src/lib/format-currency";
import { useParams } from "next/navigation";
import { getPreferredCurrency } from "src/lib/get-locale-currency";

export function CartSheet({
  cart,
  currencies
}: {
  cart: NonNullable<Awaited<ReturnType<typeof getACart>>["data"]>;
  currencies: ResponseCurrency[];
}) {
  const groupedItems = groupCartItems(cart.included?.items ?? []);
  const items = [
    ...groupedItems.regular,
    ...groupedItems.subscription_offerings,
  ];

  const discountedValues = cart.data?.meta?.display_price?.discount;
  const hasPromotion = discountedValues && discountedValues.amount !== 0;

  const { lang } = useParams();
  const cartCurrencyCode = cart.data?.meta?.display_price?.with_tax?.currency;
  const storeCurrency = getPreferredCurrency(lang as string, currencies, cartCurrencyCode);

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

  // Remove auto-applied promotions as they cannot be removed manually
  const cleanedPromotions = groupedItems.promotion.filter(
    (promo: any) => !promo?.sku?.startsWith("auto_")
  );
  // Merge item level promotions with cart level promotions, avoiding duplicates
  const mergedPromotions = [
    ...cleanedPromotions,
    ...groupedItems.itemLevelPromotion.filter(
      (itemLevel) =>
        !groupedItems.promotion.some(
          (promo: any) =>
            promo.id === itemLevel.id ||
            promo.sku === itemLevel.code ||
            promo.code === itemLevel.code,
        ),
    ),
  ]

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="rounded-md px-4 py-2 transition-all duration-200 hover:bg-slate-200/70 relative text-sm font-medium text-black hover:underline focus:text-brand-primary active:text-brand-primary">
          <span>
            {cart.included?.items && cart.included.items.length > 0 && (
              <span
                className={`${
                  cart.included.items ? "flex" : "hidden"
                } absolute right-0 top-0 h-5 w-5 items-center justify-center rounded-full bg-brand-primary p-[0.1rem] text-[0.6rem] text-white`}
              >
                {cart.included.items.length}
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
          <SheetClose className="ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
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
                        <CartItem
                          item={item}
                          thumbnail={item.image?.href}
                          currency={storeCurrency}
                        />
                      </li>
                      <Separator />
                    </Fragment>
                  )
                })}
              </ul>
            </div>
            {/* Bottom */}
            <SheetFooter className="flex flex-col sm:flex-col items-center gap-5 px-5 pb-5">
              <div className="flex flex-col self-stretch">
                <AddPromotion currencyCode={storeCurrency?.code} />
              </div>
              {mergedPromotions.length > 0 &&
                mergedPromotions.map((promotion) => {
                  return (
                    <Fragment key={promotion.id}>
                      <Separator />
                      <div
                        key={promotion.id}
                        className="flex flex-col items-start gap-2 self-stretch"
                      >
                        <div className="flex flex-row gap-2">
                          <RemoveCartPromotionXButton
                            promoCode={
                              promotion.code || (promotion as any).sku!
                            }
                          />
                          <span>{promotion.name || promotion.code}</span>
                        </div>
                      </div>
                    </Fragment>
                  )
                })}
              <Separator />
              {/* Totals */}
              <div className="flex flex-col items-start gap-2 w-full">
                {(hasSalePricing || hasPromotion) && (
                  <>
                    <div className="flex justify-between items-baseline self-stretch">
                      <span>Total before discounts</span>
                      <span className="font-medium text-lg">
                        {formattedCartTotal}
                      </span>
                    </div>
                    {hasSalePricing && (
                      <div className="flex text-red-600 justify-between items-baseline self-stretch">
                        <span>Sale markdowns</span>
                        <span className="font-medium text-lg text-red-600">
                          {formattedCartSavings}
                        </span>
                      </div>
                    )}
                    {hasPromotion && (
                      <div className="flex text-green-600 justify-between items-baseline self-stretch">
                        <span>Promo savings</span>
                        <span className="font-medium text-lg text-green-600">
                          {discountedValues.formatted}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <div className="flex justify-between items-baseline self-stretch">
                  <span>Sub Total</span>
                  <span className="font-medium text-lg">
                    {cart.data?.meta?.display_price?.without_tax?.formatted}
                  </span>
                </div>
              </div>

              {/* TOTAL SAVINGS */}
              {(hasSalePricing || hasPromotion) && (
                <div className="flex bg-green-100 px-2 rounded-lg font-medium text-green-600 justify-between items-baseline gap-10">
                  <span>Your savings</span>
                  <span>{formattedTotalCartSavings}</span>
                </div>
              )}
              <Separator />
              <SheetClose asChild>
                <Button type="button" asChild className="self-stretch">
                  <LocaleLink href="/checkout">
                    <LockClosedIcon className="w-5 h-5 mr-2" />
                    Checkout
                  </LocaleLink>
                </Button>
              </SheetClose>
              <SheetClose asChild>
                <Button
                  type="button"
                  variant="secondary"
                  asChild
                  className="self-stretch"
                >
                  <LocaleLink href="/cart">Go to bag</LocaleLink>
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
  )
}
