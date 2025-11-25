import { ProductThumbnail } from "../account/orders/[orderId]/ProductThumbnail";
import { NumberInput } from "../../../components/number-input/NumberInput";
import Link from "next/link";
import { RemoveCartItemButton } from "../../../components/cart/RemoveCartItemButton";
import { Item } from "../../../lib/group-cart-items";
import { formatCurrency } from "src/lib/format-currency";
import { ResponseCurrency } from "@epcc-sdk/sdks-shopper";

export type CartItemProps = {
  item: Item;
  thumbnail?: string;
  currency?: ResponseCurrency;
};

export function CartItem({ item, thumbnail, currency }: CartItemProps) {
  if (!item) {
    return <div>Missing cart item data</div>;
  }

  let itemLink = null;
  if (item.product_id) {
    itemLink = `/products/${item.product_id}`;
  }

  // TOTAL BEFORE SALE PRICING
  const itemQuantity = item.quantity || 1;
  const originalDisplayPrice = (item as any).productDetail?.meta?.original_display_price?.without_tax;
  const multiItemOriginalTotal =
    originalDisplayPrice
      ? itemQuantity * originalDisplayPrice.amount
      : undefined
  const formattedMultiItemOriginalTotal = multiItemOriginalTotal
    ? formatCurrency(
        multiItemOriginalTotal || 0,
        currency || { code: "USD", decimal_places: 2 },
      )
    : undefined

  // SALE SAVINGS CALCULATION
  const itemWithoutDiscountAmount = item.meta?.display_price?.without_discount?.value?.amount;
  const saleAmount =
    multiItemOriginalTotal && itemWithoutDiscountAmount
      ? itemWithoutDiscountAmount - multiItemOriginalTotal
      : undefined
  const formattedSaleAmount = saleAmount
    ? formatCurrency(
        saleAmount || 0,
        currency || { code: "USD", decimal_places: 2 },
      )
    : undefined

  // SALE SAVINGS PERCENTAGE CALCULATION
  const saleAmountUnit = Math.abs(saleAmount ?? 0);
  const salePercentage =
    saleAmountUnit && multiItemOriginalTotal ? (saleAmountUnit / multiItemOriginalTotal) * 100 : 0;
  const formattedSalePercentage =
    salePercentage > 0 ? Math.round(salePercentage) + "%" : "";

  // TOTAL SAVINGS CALCULATION
  const itemTotalDiscount = item?.meta?.display_price?.discount?.value?.amount;
  const itemTotalSavings = (saleAmount ?? 0) + (itemTotalDiscount ?? 0)
  const formattedTotalSavings = itemTotalSavings
    ? formatCurrency(
        itemTotalSavings || 0,
        currency || { code: "USD", decimal_places: 2 },
      )
    : undefined

  // TOTAL SAVINGS PERCENTAGE CALCULATION
  const originalAmount = multiItemOriginalTotal || itemWithoutDiscountAmount || 0;
  const discountAmount = Math.abs(itemTotalSavings ?? 0);
  const discountPercentage =
    originalAmount > 0 ? (discountAmount / originalAmount) * 100 : 0;
  const discountPercentFormatted =
    discountPercentage > 0 ? Math.round(discountPercentage) + "%" : "";
  
  // ITEM PROMOTIONS
  const itemDiscounts = (item as any)?.meta?.display_price?.discounts as Record<string, any> | undefined;

  return (
    <div className="flex gap-5">
      <div className="flex w-16 sm:w-24 h-20 sm:h-[7.5rem] justify-center shrink-0 items-start">
        <ProductThumbnail imageHref={thumbnail} name={item.name} />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex self-stretch">
          <div className="flex flex-col flex-1 gap-1">
            {itemLink ? (
              <Link href={`/products/${item.product_id}`}>
                <span className="font-medium text-xl">{item.name}</span>
              </Link>
            ) : (
              <span className="font-medium text-xl">{item.name}</span>
            )}

            <span className="text-sm text-black/60">
              Quantity: {item.quantity}
            </span>
          </div>

          <div className="flex h-7 gap-2 items-center">
            <span className="font-medium">
              {item.meta?.display_price?.with_tax?.unit?.formatted}
            </span>

            {!originalDisplayPrice &&
              item.meta?.display_price?.without_discount?.unit?.amount &&
              item.meta?.display_price.without_discount.unit?.amount !==
                item.meta?.display_price.with_tax?.unit?.amount && (
                <span className="text-black/60 text-sm line-through">
                  {item.meta?.display_price.without_discount.unit?.formatted}
                </span>
              )}

            {originalDisplayPrice?.amount &&
              item.meta?.display_price &&
              originalDisplayPrice?.amount !==
                item.meta?.display_price.with_tax?.unit?.amount && (
                <span className="text-black/60 text-sm line-through">
                  {originalDisplayPrice?.formatted}
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
              Sale ({formattedSalePercentage} off)
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
        <div className="flex w-[15rem] gap-5 items-center">
          <NumberInput item={item} />
          <RemoveCartItemButton cartItemId={item.id!} />
        </div>
      </div>
    </div>
  )
}
