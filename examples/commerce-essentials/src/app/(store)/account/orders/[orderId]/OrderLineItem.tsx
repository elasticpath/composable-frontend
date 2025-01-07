import { ProductThumbnail } from "./ProductThumbnail";
import { OrderItem } from "@elasticpath/js-sdk";
import Link from "next/link";

export function OrderLineItem({ orderItem }: { orderItem: OrderItem }) {
  return (
    <div className="flex gap-5 py-5 border-t border-zinc-300">
      <div className="w-16 sm:w-20 min-h-[6.25rem]">
        <Link href={`/products/${orderItem.product_id}`}>
          <ProductThumbnail productId={orderItem.product_id} />
        </Link>
      </div>
      <div className="flex gap-5 self-stretch items-start flex-1">
        <div className="flex flex-col self-stretch flex-1">
          <Link href={`/products/${orderItem.product_id}`}>
            <h1 className="text-xl font-medium sm:text-base">
              {orderItem.name}
            </h1>
          </Link>
          <span className="text-sm text-black/60">
            Quantity: {orderItem.quantity}
          </span>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <span className="text-base font-medium">
            {orderItem.meta?.display_price?.with_tax?.value.formatted}
          </span>
          {orderItem.meta?.display_price?.without_discount?.value.amount &&
            orderItem.meta?.display_price?.without_discount?.value.amount !==
              orderItem.meta?.display_price?.with_tax?.value.amount && (
              <span className="text-black/60 text-sm line-through">
                {
                  orderItem.meta?.display_price?.without_discount?.value
                    .formatted
                }
              </span>
            )}
        </div>
      </div>
    </div>
  );
}
