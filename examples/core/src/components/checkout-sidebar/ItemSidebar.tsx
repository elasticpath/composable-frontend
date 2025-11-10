"use client";
import { Separator } from "../separator/Separator";
import { AddPromotion } from "./AddPromotion";
import { CheckoutItem } from "../checkout-item/CheckoutItem";
import * as React from "react";
import { formatCurrency } from "../../lib/format-currency";
import {
  Product,
  ResponseCurrency,
  CartResponse,
  OrderMeta,
} from "@epcc-sdk/sdks-shopper";
import { Item } from "../../lib/group-cart-items";
import { ArrowDownIcon } from "@heroicons/react/24/solid";
import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";

export function ItemSidebarItems({ items }: { items: Item[] }) {
  const scrollDivRef = useRef<HTMLDivElement>(null);
  const [showScrollMore, setShowScrollMore] = useState<boolean>(false);

  useEffect(() => {
    const scrollDiv = scrollDivRef.current;
    if (!scrollDiv) return;

    const updateScrollMoreState = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollDiv;

      // Check if content is scrollable; if not, hide the visual
      if (scrollHeight <= clientHeight) {
        setShowScrollMore(false);
        return;
      }

      const scrollableHeight = scrollHeight - clientHeight;
      const scrollPercentage = (scrollTop / scrollableHeight) * 100;

      // If the user has scrolled more than 20%, hide the indicator
      if (scrollPercentage > 20) {
        setShowScrollMore(false);
      } else {
        setShowScrollMore(true);
      }
    };

    // Initial check when component mounts
    updateScrollMoreState();

    // Attach the scroll listener
    scrollDiv.addEventListener("scroll", updateScrollMoreState);

    // Cleanup event listener on unmount
    return () => {
      scrollDiv.removeEventListener("scroll", updateScrollMoreState);
    };
  }, []);

  return (
    <div
      ref={scrollDivRef}
      className="max-h-[22.505rem] overflow-auto relative"
    >
      {items && items.length > 0 && (
        <>
          {items?.map((item, index) => {
            return (
              <CheckoutItem
                priority={index < 10}
                key={item.id}
                item={item}
                image={item.image}
              />
            );
          })}
          <Separator className="mt-4" />
        </>
      )}
      <div
        className={cn(
          "sticky bottom-4 flex items-center justify-center w-full",
          !showScrollMore && "hidden",
        )}
      >
        <div className="rounded-full flex flex-row gap-2 items-center bg-gray-200 px-4 py-2">
          <span>Scroll for more items</span>
          <ArrowDownIcon className="size-4" />
        </div>
      </div>
    </div>
  );
}

export function ItemSidebarPromotions() {
  return (
    <div className="self-stretch">
      <AddPromotion />
    </div>
  );
}

export function ItemSidebarSumTotal({ meta }: { meta: Product["meta"] }) {
  return (
    <div className="flex justify-between items-baseline self-stretch">
      <span>Total</span>
      <div className="flex items-center gap-2.5">
        <span>{meta?.display_price?.with_tax?.currency}</span>
        <span className="font-medium text-2xl">
          {meta?.display_price?.with_tax?.formatted}
        </span>
      </div>
    </div>
  );
}

export function ItemSidebarTotals({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-2 w-full">{children}</div>
  );
}

export function ItemSidebarTotalsSubTotal({
  meta,
}: {
  meta: OrderMeta | CartResponse["meta"];
}) {
  let value;

  if (meta && "display_price" in meta) {
    value = meta.display_price?.without_discount?.formatted ?? "";
  } else if (meta && "with_tax" in meta) {
    value = meta.display_price?.without_tax?.formatted ?? "";
  } else {
    value = "";
  }

  return <ItemSidebarTotalsItem label="Sub Total" description={value} />;
}

export function ItemSidebarTotalsDiscount({ meta }: { meta: Product["meta"] }) {
  const discountedValues = (
    meta?.display_price as
      | { discount: { amount: number; formatted: string } }
      | undefined
  )?.discount;

  return (
    discountedValues &&
    discountedValues.amount !== 0 && (
      <div className="flex justify-between items-baseline self-stretch">
        <span className="text-sm">Discount</span>
        <span className="font-medium text-red-600">
          {discountedValues?.formatted ?? ""}
        </span>
      </div>
    )
  );
}

export function ItemSidebarTotalsTax({
  meta,
}: {
  meta: OrderMeta | CartResponse["meta"];
}) {
  return (
    <ItemSidebarTotalsItem
      label="Tax"
      description={meta?.display_price?.tax?.formatted ?? ""}
    />
  );
}

export function ItemSidebarTotalsItem({
  label,
  description,
}: {
  label: string;
  description: string;
}) {
  return (
    <div className="flex justify-between items-baseline self-stretch">
      <span className="text-sm">{label}</span>
      <span className="font-medium">{description}</span>
    </div>
  );
}

export function resolveTotalInclShipping(
  shippingAmount: number,
  totalAmount: number,
  storeCurrency: ResponseCurrency,
): string | undefined {
  return formatCurrency(shippingAmount + totalAmount, storeCurrency);
}
