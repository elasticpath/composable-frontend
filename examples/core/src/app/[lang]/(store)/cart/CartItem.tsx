import { ProductThumbnail } from "../account/orders/[orderId]/ProductThumbnail";
import { NumberInput } from "src/components/number-input/NumberInput";
import { LocaleLink } from "src/components/LocaleLink";
import { RemoveCartItemButton } from "src/components/cart/RemoveCartItemButton";
import { Item } from "src/lib/group-cart-items";
import { ResponseCurrency } from "@epcc-sdk/sdks-shopper";
import { calculateMultiItemOriginalTotal, calculateSaleAmount, calculateTotalSavings, getFormattedPercentage, getFormattedValue } from "src/lib/price-calculation";
import { getProductURLSegment } from "src/lib/product-helper";

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
  const formattedMultiItemOriginalTotal = getFormattedValue(multiItemOriginalTotal!, currency!);

  // SALE SAVINGS CALCULATION
  const saleAmount = calculateSaleAmount(item);
  const formattedSaleAmount = getFormattedValue(saleAmount!, currency!);

  // SALE SAVINGS PERCENTAGE CALCULATION
  const formattedSalePercentage = getFormattedPercentage(saleAmount!, multiItemOriginalTotal!);

  // TOTAL SAVINGS CALCULATION
  const itemTotalSavings = calculateTotalSavings(item);
  const formattedTotalSavings = getFormattedValue(itemTotalSavings!, currency!);

  // TOTAL SAVINGS PERCENTAGE CALCULATION
  const itemWithoutDiscountAmount = item.meta?.display_price?.without_discount?.value?.amount;
  const discountPercentFormatted = getFormattedPercentage(itemTotalSavings!, (multiItemOriginalTotal || itemWithoutDiscountAmount)!);

  // ITEM PROMOTIONS
  const itemDiscounts = (item as any)?.meta?.display_price?.discounts as Record<string, any> | undefined;

  // Cannonical URL
  const productSlug = (item as any)?.slug || (item as any).productDetail?.attributes?.slug;
  const canonicalURL = getProductURLSegment({ id: item.product_id, attributes: { slug: productSlug } });

  return (
    <div className="flex gap-5">
      <div className="flex w-16 sm:w-24 h-20 sm:h-[7.5rem] justify-center shrink-0 items-start">
        <ProductThumbnail imageHref={thumbnail} name={item.name} />
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex self-stretch">
          <div className="flex flex-col flex-1 gap-1">
            {itemLink ? (
              <LocaleLink href={canonicalURL}>
                <span className="font-medium text-xl">{item.name}</span>
              </LocaleLink>
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
        <div className="flex w-[15rem] gap-5 items-center">
          <NumberInput item={item} currency={currency} />
          <RemoveCartItemButton cartItemId={item.id!} />
        </div>
      </div>
    </div>
  )
}
