import { ProductThumbnail } from "../account/orders/[orderId]/ProductThumbnail";
import { NumberInput } from "../../../components/number-input/NumberInput";
import Link from "next/link";
import { RemoveCartItemButton } from "../../../components/cart/RemoveCartItemButton";
import { Item } from "../../../lib/group-cart-items";
import { getByContextAllProducts } from "@epcc-sdk/sdks-shopper";

export type CartItemProps = {
  item: Item;
  thumbnail?: string;
};

export function CartItem({ item, thumbnail }: CartItemProps) {
  if (!item) {
    return <div>Missing cart item data</div>;
  }

  let itemLink = null;
  if (item.product_id) {
    itemLink = `/products/${item.product_id}`;
  }

  return (
    <div className="flex gap-5">
      <div className="flex w-16 sm:w-24 h-20 sm:h-[7.5rem] justify-center shrink-0 items-start">
        <ProductThumbnail imageHref={thumbnail} name={item.name} />
      </div>
      <div className="flex flex-col gap-5 flex-1">
        <div className="flex gap-5 self-stretch">
          <div className="flex flex-col flex-1 gap-2.5">
            {itemLink ? (
              <Link href={`/products/${item.product_id}`}>
                <span className="font-medium text-xl">{item.name}</span>
              </Link>
            ) : (
              <span className="font-medium text-xl">{item.name}</span>
            )}

            <span className="text-sm text-black/60">
              Quantity: {item.quantity}
            </span>
          </div>
          <div className="flex h-7 gap-2 flex-col">
            <span className="font-medium">
              {item.meta?.display_price?.with_tax?.formatted}
            </span>
            {item.meta?.display_price?.without_discount?.amount &&
              item.meta?.display_price.without_discount.amount !==
                item.meta?.display_price.with_tax?.amount && (
                <span className="text-black/60 text-sm line-through">
                  {item.meta?.display_price.without_discount.formatted}
                </span>
              )}
          </div>
        </div>
        <div className="flex w-[15rem] gap-5 items-center">
          <NumberInput item={item} />
          <RemoveCartItemButton cartItemId={item.id!} />
        </div>
      </div>
    </div>
  );
}
