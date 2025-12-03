import { ReactNode } from "react";
import { ProductThumbnail } from "./[orderId]/ProductThumbnail";
import Link from "next/link";
import { formatIsoDateString } from "src/lib/format-iso-date-string";
import { OrderItemResponse, OrderResponse } from "@epcc-sdk/sdks-shopper";

export type OrderItemProps = {
  children?: ReactNode;
  order: OrderResponse;
  orderItems: OrderItemResponse[];
  imageUrl?: string;
};

export function sortOrderItems(items: OrderItemResponse[]) {
  return items.sort(
    (a, b) => (b.unit_price?.amount ?? 0) - (a.unit_price?.amount ?? 0),
  );
}

export function OrderItem({
  children,
  order,
  orderItems,
  imageUrl,
}: OrderItemProps) {
  // Sorted order items are used to determine which image to show
  // showing the most expensive item's image
  const sortedOrderItems = sortOrderItems(orderItems);
  return (
    <section className="flex gap-5 w-full py-5 shadow-[0_-1px_0_0_rgba(0,0,0,0.10)]">
      <div>
        <Link href={`/account/orders/${order.id}`}>
          <ProductThumbnail
            name={sortedOrderItems[0]?.name}
            imageHref={imageUrl}
          />
        </Link>
      </div>
      <div className="flex flex-1 flex-col gap-y-1.5">
        <span className="text-sm font-normal text-black/60">
          Order # {order.external_ref ?? order.id}
        </span>
        <Link href={`/account/orders/${order.id}`}>
          <h2 className="font-medium text-base">
            {formatOrderItemsTitle(sortedOrderItems)}
          </h2>
        </Link>
        {children}
      </div>
      <div className="flex flex-col hidden sm:flex">
        <time
          className="text-sm text-black/60"
          dateTime={order.meta?.timestamps?.created_at}
        >
          {formatIsoDateString(order.meta?.timestamps?.created_at!)}
        </time>
        <span>{order.meta?.display_price?.with_tax?.formatted}</span>
      </div>
    </section>
  );
}

function formatOrderItemsTitle(orderItems: OrderItemResponse[]): string {
  if (orderItems.length === 0) {
    return "No items in the order";
  }

  if (orderItems.length === 1) {
    return orderItems[0]!.name!;
  }

  const firstTwoItems = orderItems.slice(0, 2).map((item) => item.name);
  const remainingItemCount = orderItems.length - 2;

  if (remainingItemCount === 0) {
    return `${firstTwoItems.join(" and ")} in the order`;
  }

  return `${firstTwoItems.join(", ")} and ${remainingItemCount} other item${
    remainingItemCount > 1 ? "s" : ""
  }`;
}
