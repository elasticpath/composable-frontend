"use client";
import { useCartRemoveItem } from "@elasticpath/react-shopper-hooks";
import { ProductThumbnail } from "../account/orders/[orderId]/ProductThumbnail";
import Link from "next/link";
import { NumberInput } from "../../../components/number-input/NumberInput";
import { CartItemProps } from "./CartItem";
import { LoadingDots } from "../../../components/LoadingDots";
import { getProductURLSegment } from "../../../lib/product-helper";
import PriceDisplay, { SalePriceDisplayStyle } from "../../../components/product/PriceDisplay";

export function CartItemWide({ item, productSlug }: CartItemProps) {
  const { mutate, isPending } = useCartRemoveItem();
  const canonicalURL = getProductURLSegment({ id: item.product_id, attributes: { slug: productSlug } });
  const display_original_price = item.meta.display_price.without_discount?.value.amount &&
    item.meta.display_price.without_discount?.value.amount !==
    item.meta.display_price.with_tax.value.amount;
  return (
    <div className="flex gap-5 self-stretch">
      {/* Thumbnail */}
      <div className="flex h-20 sm:h-[7.5rem] justify-center lg:shrink-0 items-start">
        <ProductThumbnail productId={item.product_id} />
      </div>
      {/* Details */}
      <div className="flex flex-col gap-5 flex-only-grow items-start">
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-14 self-stretch">
          <div className="flex flex-col flex-1 gap-2.5">
            <Link href={canonicalURL}>
              <span className="font-medium text-xl lg:text-2xl">
                {item.name}
              </span>
            </Link>
            <span className="text-sm text-black/60">
              Quantity: {item.quantity}
            </span>
          </div>
          <div className="flex flex-row gap-5 lg:flex-col items-center lg:gap-2">
            <NumberInput item={item} />
            {isPending ? (
              <LoadingDots className="bg-black" />
            ) : (
              <button
                type="button"
                className="text-sm underline text-black/60"
                onClick={() => mutate({ itemId: item.id })}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="flex lg:pl-14 flex-col h-7 items-end">
        <PriceDisplay
          display_price={item.meta.display_price.with_tax.value}
          original_display_price={
            display_original_price &&
            item.meta.display_price.without_discount?.value
          }
          showCurrency={false}
          salePriceDisplay={SalePriceDisplayStyle.strikePriceWithCalcPercent}
        />
      </div>
    </div>
  );
}
