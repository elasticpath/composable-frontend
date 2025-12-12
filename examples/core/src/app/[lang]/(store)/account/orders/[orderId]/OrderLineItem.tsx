import { ProductThumbnail } from "./ProductThumbnail";
import { LocaleLink } from "src/components/LocaleLink";
import { ElasticPathFile, OrderItemResponse } from "@epcc-sdk/sdks-shopper";
import { getProductURLSegment } from "src/lib/product-helper";

export function OrderLineItem({
  orderItem,
  image,
  productSlug,
}: {
  orderItem: OrderItemResponse;
  image?: ElasticPathFile;
  productSlug?: string;
}) {
  const canonicalURL = getProductURLSegment({ id: orderItem.product_id, attributes: { slug: productSlug } });
  return (
    <div className="flex gap-5 py-5 border-t border-zinc-300">
      <div className="w-16 sm:w-20 min-h-[6.25rem]">
        <LocaleLink href={canonicalURL}>
          <ProductThumbnail
            name={orderItem.name}
            imageHref={image?.link?.href}
          />
        </LocaleLink>
      </div>
      <div className="flex gap-5 self-stretch items-start flex-1">
        <div className="flex flex-col self-stretch flex-1">
          <LocaleLink href={canonicalURL}>
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
