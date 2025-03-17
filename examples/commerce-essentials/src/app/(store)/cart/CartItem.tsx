"use client";
import { useCartRemoveItem } from "@elasticpath/react-shopper-hooks";
import { ProductThumbnail } from "../account/orders/[orderId]/ProductThumbnail";
import { NumberInput } from "../../../components/number-input/NumberInput";
import Link from "next/link";
import { CartItem as CartItemType } from "@elasticpath/js-sdk";
import { LoadingDots } from "../../../components/LoadingDots";
import { getProductURLSegment } from "../../../lib/product-helper";
import PriceDisplay, { SalePriceDisplayStyle } from "../../../components/product/PriceDisplay";

export type CartItemProps = {
  item: CartItemType;
  productSlug?: string;
};

export function CartItem({ item, productSlug }: CartItemProps) {
  const { mutate, isPending } = useCartRemoveItem();
  const canonicalURL = getProductURLSegment({ id: item.product_id, attributes: { slug: productSlug } });
  const display_original_price =
    item.meta.display_price.without_discount?.value.amount &&
    item.meta.display_price.without_discount?.value.amount !==
      item.meta.display_price.with_tax.value.amount;
  return (
    <div className="flex gap-5">
      <div className="flex w-16 sm:w-24 h-20 sm:h-[7.5rem] justify-center shrink-0 items-start">
        <ProductThumbnail productId={item.product_id} />
      </div>
      <div className="flex flex-col gap-5 flex-1">
        <div className="flex gap-5 self-stretch">
          <div className="flex flex-col flex-1 gap-2.5">
            <Link href={canonicalURL}>
              <span className="font-medium text-xl">{item.name}</span>
            </Link>
            <span className="text-sm text-black/60">
              Quantity: {item.quantity}
            </span>
          </div>
          <div className="flex h-7 gap-2 flex-col">
            <PriceDisplay
              display_price={item.meta.display_price.with_tax.value}
              original_display_price={
                display_original_price &&
                item.meta.display_price.without_discount?.value
              }
              salePriceDisplay={
                SalePriceDisplayStyle.strikePriceWithCalcPercent
              }
              showCurrency={false}
              priceDisplaySize="text-xl"
              saleCalcDisplaySize="text-sm"
            />{" "}
          </div>
        </div>
        <div className="flex w-[15rem] gap-5 items-center">
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
  );
}
