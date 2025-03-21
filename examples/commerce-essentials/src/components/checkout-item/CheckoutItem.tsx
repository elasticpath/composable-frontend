"use client";
import { CartItem } from "@elasticpath/js-sdk";
import Link from "next/link";
import { ProductThumbnail } from "../../app/(store)/account/orders/[orderId]/ProductThumbnail";
import { getProductURLSegment } from "../../lib/product-helper";
import PriceDisplay, { SalePriceDisplayStyle } from "../product/PriceDisplay";

export function CheckoutItem({ item, productSlug }: { item: CartItem, productSlug?: string }) {
  const canonicalURL = getProductURLSegment({ id: item.product_id, attributes: { slug: productSlug } });
  const display_original_price =
    item.meta.display_price.without_discount?.value.amount &&
    item.meta.display_price.without_discount?.value.amount !==
      item.meta.display_price.with_tax.value.amount;
  return (
    <div className="flex w-full lg:w-[24.375rem] gap-5 items-start">
      <div className="flex flex-col w-[4.5rem] h-[5.626rem] justify-start shrink-0 items-center">
        <ProductThumbnail productId={item.product_id} />
      </div>
      <div className="flex flex-col items-start gap-2.5 flex-only-grow">
        <Link href={canonicalURL}>
          <span className="font-medium text-xl">{item.name}</span>
        </Link>
        <span className="text-sm text-black/60">Quantity: {item.quantity}</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <PriceDisplay
          display_price={item.meta.display_price.with_tax.value}
          original_display_price={
            display_original_price &&
            item.meta.display_price.without_discount?.value
          }
          showCurrency={false}
          salePriceDisplay={SalePriceDisplayStyle.strikePriceWithCalcValue}
        />
      </div>
    </div>
  );
}
