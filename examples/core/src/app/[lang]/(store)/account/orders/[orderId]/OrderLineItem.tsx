import { ProductThumbnail } from "./ProductThumbnail";
import { LocaleLink } from "src/components/LocaleLink";
import { ElasticPathFile, OrderItemResponse } from "@epcc-sdk/sdks-shopper";

export function OrderLineItem({
  orderItem,
  image,
}: {
  orderItem: OrderItemResponse;
  image?: ElasticPathFile;
}) {
  return (
    <div className="flex gap-5 py-5 border-t border-zinc-300">
      <div className="w-16 sm:w-20 min-h-[6.25rem]">
        <LocaleLink href={`/products/${orderItem.product_id}`}>
          <ProductThumbnail
            name={orderItem.name}
            imageHref={image?.link?.href}
          />
        </LocaleLink>
      </div>
      <div className="flex gap-5 self-stretch items-start flex-1">
        <div className="flex flex-col self-stretch flex-1">
          <LocaleLink href={`/products/${orderItem.product_id}`}>
            <h1 className="text-xl font-medium sm:text-base">
              {orderItem.name}
            </h1>
          </LocaleLink>
          <span className="text-sm text-black/60">
            Quantity: {orderItem.quantity}
          </span>
        </div>
        <div className="flex flex-col gap-2 items-center">
          <span className="text-base font-medium">
            {orderItem.meta?.display_price?.with_tax?.value?.formatted}
          </span>
          {orderItem.meta?.display_price?.without_discount?.value?.amount &&
            orderItem.meta?.display_price?.without_discount?.value?.amount !==
              orderItem.meta?.display_price?.with_tax?.value?.amount && (
              <span className="text-black/60 text-sm line-through">
                {
                  orderItem.meta?.display_price?.without_discount?.value
                    ?.formatted
                }
              </span>
            )}
        </div>
      </div>
    </div>
  );
}
