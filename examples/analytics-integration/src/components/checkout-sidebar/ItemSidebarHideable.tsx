"use client";
import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../accordion/Accordion";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import { CartResponse, OrderMeta } from "@epcc-sdk/sdks-shopper";

export function ItemSidebarHideable({
  children,
  meta,
}: {
  meta: CartResponse["meta"] | OrderMeta;
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
      <div className="hidden lg:flex lg:sticky lg:top-4">{children}</div>
    </>
  );
}
