import { ProductThumbnail } from "../account/orders/[orderId]/ProductThumbnail";
import Link from "next/link";
import { NumberInput } from "../../../components/number-input/NumberInput";
import { CartItemProps } from "./CartItem";
import { RemoveCartItemButton } from "../../../components/cart/RemoveCartItemButton";

export function CartItemWide({ item, thumbnail }: CartItemProps) {
  return (
    <div className="flex gap-5 self-stretch">
      {/* Thumbnail */}
      <div className="flex h-20 sm:h-[7.5rem] justify-center lg:shrink-0 items-start">
        <ProductThumbnail name={item.name} imageHref={thumbnail} />
      </div>
      {/* Details */}
      <div className="flex flex-col gap-5 flex-only-grow items-start">
        <div className="flex flex-col gap-5 lg:flex-row lg:gap-14 self-stretch">
          <div className="flex flex-col flex-1 gap-2.5">
            <Link href={`/products/${item?.product_id}`}>
              <span className="font-medium text-xl lg:text-2xl">
                {item?.name}
              </span>
            </Link>
            <span className="text-sm text-black/60">
              Quantity: {item?.quantity}
            </span>
            {item?.type === "cart_item" && item?.location && (
              <span className="text-sm text-black/60">
                Location: {item?.location}
              </span>
            )}
          </div>
          <div className="flex flex-row gap-5 lg:flex-col items-center lg:gap-2">
            <NumberInput item={item} />
            <RemoveCartItemButton cartItemId={item?.id!} />
          </div>
        </div>
      </div>
      <div className="flex lg:pl-14 flex-col h-7 items-end">
        <span className="font-medium">
          {item?.meta?.display_price?.with_tax?.formatted}
        </span>
        {item?.meta?.display_price?.without_discount?.amount &&
          item?.meta?.display_price?.without_discount?.amount !==
            item?.meta?.display_price.with_tax?.amount && (
            <span className="text-black/60 text-sm line-through">
              {item?.meta?.display_price?.without_discount.formatted}
            </span>
          )}
      </div>
    </div>
  );
}
