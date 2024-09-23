"use client";
import { Separator } from "../separator/Separator";
import { AddPromotion } from "./AddPromotion";
import { CheckoutItem } from "../checkout-item/CheckoutItem";
import { CartState } from "@elasticpath/react-shopper-hooks";
import {
  Accordion,
  AccordionContent,
  AccordionTrigger,
  AccordionItem,
} from "../accordion/Accordion";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import * as React from "react";
import { Currency } from "@elasticpath/js-sdk";
import { formatCurrency } from "../../lib/format-currency";

export function ItemSidebarItems({ items }: { items: CartState["items"] }) {
  return (
    <>
      {items && items.length > 0 && (
        <>
          {items?.map((item) => <CheckoutItem key={item.id} item={item} />)}
          <Separator />
        </>
      )}
    </>
  );
}

export function ItemSidebarPromotions() {
  return (
    <div className="self-stretch">
      <AddPromotion />
    </div>
  );
}

export function ItemSidebarSumTotal({ meta }: { meta: CartState["meta"] }) {
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
  meta: CartState["meta"];
}) {
  return (
    <ItemSidebarTotalsItem
      label="Sub Total"
      description={
        // @ts-ignore TODO add without_discount to sdk types
        meta?.display_price?.without_discount?.formatted ??
        meta?.display_price?.without_tax?.formatted ??
        ""
      }
    />
  );
}

export function ItemSidebarTotalsDiscount({
  meta,
}: {
  meta: CartState["meta"];
}) {
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

export function ItemSidebarTotalsTax({ meta }: { meta: CartState["meta"] }) {
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

export function ItemSidebarHideable({
  children,
  meta,
}: {
  meta: CartState["meta"];
  children: React.ReactNode;
}) {
  return (
    <>
      <Accordion
        type="single"
        defaultValue="summary"
        collapsible
        className="w-full lg:hidden"
      >
        <AccordionItem value="summary">
          <AccordionTrigger className="flex px-5 h-14 items-center gap-3 bg-[#F9F9F9] border-y border-black/10 [&[data-state=open]>#summaryUpDownChevron]:rotate-180">
            <ShoppingBagIcon className="h-6 w-6" />
            <span className="underline">Hide order summary</span>
            <ChevronDownIcon
              id="summaryUpDownChevron"
              className="h-4 w-4 shrink-0 transition-transform duration-200 "
            />
            <span className="font-medium text-lg hover:no-underline">
              {meta?.display_price?.with_tax?.formatted}
            </span>
          </AccordionTrigger>
          <AccordionContent className="pt-10">{children}</AccordionContent>
        </AccordionItem>
      </Accordion>
      <div className="hidden lg:flex">{children}</div>
    </>
  );
}

export function resolveTotalInclShipping(
  shippingAmount: number,
  totalAmount: number,
  storeCurrency: Currency,
): string | undefined {
  return formatCurrency(shippingAmount + totalAmount, storeCurrency);
}
