"use client";
import { Separator } from "../../../components/separator/Separator";
import * as React from "react";
import { OrderResponse, OrderItemResponse } from "@epcc-sdk/sdks-shopper";

export function ConfirmationSidebar({
  order,
  orderItems,
}: {
  order: OrderResponse;
  orderItems: OrderItemResponse[];
}) {
  if (!order || !orderItems) {
    return null;
  }

  // Separate product items from shipping
  const productItems = orderItems.filter(
    (item) => item.unit_price?.amount! >= 0 && !item.sku?.startsWith("__shipping_")
  );
  const shippingItem = orderItems.find((item) =>
    item.sku?.startsWith("__shipping_")
  );

  return (
    <div className="inline-flex flex-col items-start gap-5 w-full lg:w-[24.375rem] px-5 lg:px-0">
      {/* Product Items */}
      <div className="flex flex-col gap-5 w-full">
        {productItems.map((item) => (
          <div key={item.id} className="flex justify-between items-start w-full">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-xs text-black/60">Qty: {item.quantity}</span>
            </div>
            <span className="text-sm font-medium">
              {item.meta?.display_price?.with_tax?.value?.formatted}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      {/* Order Totals */}
      <div className="flex flex-col gap-2 w-full">
        {/* Subtotal */}
        {order.meta?.display_price?.without_discount?.formatted && (
          <div className="flex justify-between items-baseline self-stretch">
            <span className="text-sm text-black/60">Subtotal</span>
            <span className="text-sm">
              {order.meta.display_price.without_discount.formatted}
            </span>
          </div>
        )}

        {/* Shipping */}
        {shippingItem && (
          <div className="flex justify-between items-baseline self-stretch">
            <span className="text-sm text-black/60">Shipping</span>
            <span className="text-sm">
              {shippingItem.meta?.display_price?.with_tax?.value?.formatted}
            </span>
          </div>
        )}

        {/* Discount */}
        {order.meta?.display_price?.discount?.amount && 
         order.meta.display_price.discount.amount > 0 && (
          <div className="flex justify-between items-baseline self-stretch">
            <span className="text-sm text-black/60">Discount</span>
            <span className="text-sm">
              -{order.meta.display_price.discount.formatted}
            </span>
          </div>
        )}

        {/* Tax */}
        {order.meta?.display_price?.tax?.amount && 
         order.meta.display_price.tax.amount > 0 && (
          <div className="flex justify-between items-baseline self-stretch">
            <span className="text-sm text-black/60">Tax</span>
            <span className="text-sm">
              {order.meta.display_price.tax.formatted}
            </span>
          </div>
        )}
      </div>

      <Separator />

      {/* Total */}
      <div className="flex justify-between items-baseline self-stretch">
        <span className="text-lg font-medium">Total</span>
        <div className="flex items-center gap-2.5">
          <span className="font-medium text-2xl">
            {order.meta?.display_price?.with_tax?.formatted}
          </span>
        </div>
      </div>
    </div>
  );
}