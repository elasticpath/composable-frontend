"use client";
import { ProductThumbnail } from "../../app/(store)/account/orders/[orderId]/ProductThumbnail";
import Link from "next/link";
import { Item } from "../../lib/group-cart-items";

export function CheckoutItem({
  item,
  image,
  priority,
}: {
  item: Item;
  priority?: boolean;
  image?: Item["image"];
}) {
  return (
    <div className="flex w-full lg:w-[24.375rem] gap-5 items-start">
      <div className="flex flex-col w-[4.5rem] h-[5.626rem] justify-start shrink-0 items-center">
        <ProductThumbnail
          name={item.name}
          imageHref={image?.href}
          priority={priority}
        />
      </div>
      <div className="flex flex-col items-start gap-2.5 flex-only-grow">
        <Link href={`/products/${item.product_id}`}>
          <span className="font-medium text-xl">{item.name}</span>
        </Link>
        <span className="text-sm text-black/60">Quantity: {item.quantity}</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="font-medium">
          {item.meta?.display_price?.with_tax?.formatted}
        </span>
        {item.meta?.display_price?.without_discount?.amount &&
          item.meta.display_price.without_discount?.amount !==
            item.meta?.display_price?.with_tax?.amount && (
            <span className="text-black/60 text-sm line-through">
              {item.meta.display_price.without_discount?.formatted}
            </span>
          )}
      </div>
    </div>
  );
}
