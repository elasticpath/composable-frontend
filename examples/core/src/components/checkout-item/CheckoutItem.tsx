"use client";
import { ProductThumbnail } from "../../app/(store)/account/orders/[orderId]/ProductThumbnail";
import Link from "next/link";
import { Item } from "../../lib/group-cart-items";
import { formatCurrency } from "src/lib/format-currency";
import { ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { calculateMultiItemOriginalTotal, calculateSaleAmount, calculateTotalSavings, getFormattedPercentage, getFormattedValue } from "src/lib/price-calculation";

export function CheckoutItem({
  item,
  image,
  priority,
  storeCurrency,
}: {
  item: Item;
  priority?: boolean;
  image?: Item["image"];
  storeCurrency?: ResponseCurrency;
}) {
  const itemDisplayPrice = item.meta?.display_price?.with_tax?.unit;
  const fallbackDisplayPrice = (item as any).productDetail?.meta?.display_price?.without_tax;
  const originalDisplayPrice = (item as any).productDetail?.meta?.original_display_price?.without_tax;
  const finalOriginalPrice = originalDisplayPrice
    ? originalDisplayPrice
    : fallbackDisplayPrice &&
        fallbackDisplayPrice.amount !== itemDisplayPrice?.amount
      ? fallbackDisplayPrice
      : undefined;

  // TOTAL BEFORE SALE PRICING
  const multiItemOriginalTotal = calculateMultiItemOriginalTotal(item);
  const formattedMultiItemOriginalTotal = getFormattedValue(multiItemOriginalTotal!, storeCurrency!);

  // SALE SAVINGS CALCULATION
  const saleAmount = calculateSaleAmount(item);
  const formattedSaleAmount = getFormattedValue(saleAmount!, storeCurrency!);

  // SALE SAVINGS PERCENTAGE CALCULATION
  const formattedSalePercentage = getFormattedPercentage(saleAmount!, multiItemOriginalTotal!);

  // TOTAL SAVINGS CALCULATION
  const itemTotalSavings = calculateTotalSavings(item);
  const formattedTotalSavings = getFormattedValue(itemTotalSavings!, storeCurrency!);

  // TOTAL SAVINGS PERCENTAGE CALCULATION
  const itemWithoutDiscountAmount = item.meta?.display_price?.without_discount?.value?.amount;
  const discountPercentFormatted = getFormattedPercentage(itemTotalSavings!, (multiItemOriginalTotal || itemWithoutDiscountAmount)!);
  
  // ITEM PROMOTIONS
  const itemDiscounts = (item as any)?.meta?.display_price?.discounts as Record<string, any> | undefined;

  return (
    <div className="flex w-full lg:w-[24.375rem] gap-2 pb-4 items-start">
      <div className="flex flex-col w-[4.5rem] h-[5.626rem] justify-start shrink-0 items-center">
        <ProductThumbnail
          name={item.name}
          imageHref={image?.href}
          priority={priority}
        />
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <div className="flex justify-between">
          <div className="flex flex-col items-start gap-1 flex-only-grow">
            <Link href={`/products/${item.product_id}`}>
              <span className="font-medium text-xl">{item.name}</span>
            </Link>
            <span className="text-sm text-black/60">Quantity: {item.quantity}</span>
          </div>

          <div className="flex h-7 gap-2 items-center">
            <span className="font-medium">
              {item.meta?.display_price?.with_tax?.unit?.formatted}
            </span>

            {!finalOriginalPrice &&
              item.meta?.display_price?.without_discount?.unit?.amount &&
              item.meta?.display_price.without_discount.unit?.amount !==
                item.meta?.display_price.with_tax?.unit?.amount && (
                <span className="text-black/60 text-sm line-through">
                  {item.meta?.display_price.without_discount.unit?.formatted}
                </span>
              )}

            {finalOriginalPrice?.amount &&
              item.meta?.display_price &&
              finalOriginalPrice?.amount !==
                item.meta?.display_price.with_tax?.unit?.amount && (
                <span className="text-black/60 text-sm line-through">
                  {finalOriginalPrice?.formatted}
                </span>
              )}

            {originalDisplayPrice ? (
              <span className="bg-black px-1 rounded-sm text-white text-[0.7rem]">
                SALE
              </span>
            ) : (
              <></>
            )}
          </div>
        </div>
        
        {item.quantity > 1 && (
          <div className="flex self-stretch items-center ">
            <div className="flex flex-col flex-1 gap-1">
              <span className="text-sm text-black/60">
                Line total: ({item.quantity} x{" "}
                {item.meta?.display_price?.with_tax?.unit?.formatted})
              </span>
            </div>

            <div className="flex gap-0 flex-col text-right">
              <span className="font-medium">
                {item.meta?.display_price?.with_tax?.value?.formatted}
              </span>

              {!formattedMultiItemOriginalTotal &&
                item.meta?.display_price?.without_discount?.value?.amount &&
                item.meta?.display_price.without_discount.value?.amount !==
                  item.meta?.display_price.with_tax?.value?.amount && (
                  <span className="text-black/60 text-sm line-through">
                    {item.meta?.display_price.without_discount.value?.formatted}
                  </span>
                )}

              {formattedMultiItemOriginalTotal && (
                <span className="text-black/60 text-sm line-through">
                  {formattedMultiItemOriginalTotal}
                </span>
              )}
            </div>
          </div>
        )}

        {/* SALE PRICE */}
        {formattedSaleAmount ? (
          <div className="flex justify-between">
            <span className="text-red-600 text-sm">
              {originalDisplayPrice
                ? `Sale (${formattedSalePercentage} off)`
                : `Bulk offer (${formattedSalePercentage} off)`}
            </span>
            <span className="text-red-600 text-sm">
              ({formattedSaleAmount})
            </span>
          </div>
        ) : (
          <></>
        )}

        {/* PROMO PRICES */}
        {itemDiscounts &&
          Object.entries(itemDiscounts).map(([key, discount]) => (
            <div key={key} className="flex justify-between">
              <span className="text-green-600 text-sm">Promo ({key})</span>
              <span className="text-green-600 text-sm">
                ({discount.formatted})
              </span>
            </div>
          ))}

        {/* TOTAL SAVINGS */}
        {item.meta?.display_price?.discount?.value?.amount ? (
          <div className="flex justify-end">
            <span className="text-green-600 text-sm">
              You save{" "}
              <span className="font-bold">
                {formattedTotalSavings}
              </span>{" "}
              ({discountPercentFormatted})
            </span>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
