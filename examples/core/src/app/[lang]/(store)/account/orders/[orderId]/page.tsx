import { cookies } from "next/headers";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "src/lib/cookie-constants";
import { notFound, redirect } from "next/navigation";
import { retrieveAccountMemberCredentials } from "src/lib/retrieve-account-member-credentials";
import { Button } from "src/components/button/Button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { LocaleLink } from "src/components/LocaleLink";
import { formatIsoDateString } from "src/lib/format-iso-date-string";
import { OrderLineItem } from "./OrderLineItem";
import { createElasticPathClient } from "src/lib/create-elastic-path-client";
import { getAnOrder, getByContextAllProducts } from "@epcc-sdk/sdks-shopper";
import { resolveShopperOrder } from "../resolve-shopper-order";
import { extractCartItemProductIds } from "src/lib/extract-cart-item-product-ids";
import { TAGS } from "src/lib/constants";
import { extractCartItemMedia } from "../../../../(checkout)/checkout/extract-cart-item-media";

export const dynamic = "force-dynamic";

export default async function Order(props: {
  params: Promise<{ orderId: string, lang: string }>;
}) {
  const params = await props.params;
  const cookieStore = await cookies();
  const lang = params?.lang;

  const accountMemberCookie = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCookie) {
    return redirect(lang ? `/${lang}/login` : "/login");
  }

  const client = createElasticPathClient();

  const result = await getAnOrder({
    client,
    path: {
      orderID: params.orderId,
    },
    query: {
      include: ["items"],
    },
    next: {
      tags: [TAGS.orders],
    },
  });

  if (!result.data?.data) {
    return notFound();
  }

  const items = result.data.included?.items;

  const productIds = extractCartItemProductIds(
    result.data.included?.items ?? [],
  );

  const productsResponse = await getByContextAllProducts({
    client,
    query: {
      filter: `in(id,${productIds})`,
      include: ["main_image"],
    },
    next: {
      tags: [TAGS.orders],
    },
  });

  const images = extractCartItemMedia({
    items: items ?? [],
    products: productsResponse.data?.data ?? [],
    mainImages: productsResponse.data?.included?.main_images ?? [],
  });

  const shopperOrder = result.data.included
    ? resolveShopperOrder([result.data.data], items ?? [], images)[0]
    : { raw: result.data.data, items: [] };

  const shippingAddress = shopperOrder?.raw.shipping_address;

  const productItems = shopperOrder?.items.filter(
    (item) =>
      item.unit_price?.amount! >= 0 && !item.sku!.startsWith("__shipping_"),
  );
  const shippingItem = shopperOrder?.items.find((item) =>
    item.sku!.startsWith("__shipping_"),
  );

  return (
    <div className="flex flex-col gap-5 items-start w-full">
      <div className="flex self-stretch">
        <Button variant="secondary" size="medium" asChild>
          <LocaleLink href="/account/orders">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to orders
          </LocaleLink>
        </Button>
      </div>
      <div className="w-full border-t border-zinc-300"></div>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl">Order # {shopperOrder?.raw.id}</h1>
          <time dateTime={shopperOrder?.raw.meta?.timestamps?.created_at}>
            {formatIsoDateString(
              shopperOrder?.raw?.meta?.timestamps?.created_at!,
            )}
          </time>
        </div>
      </div>
      <div className="flex py-4 self-stretch justify-between">
        <div className="flex flex-col gap-2.5">
          <span className="font-medium">Shipping address</span>
          <p translate="no">
            {shippingAddress?.first_name} {shippingAddress?.last_name}
            <br />
            {shippingAddress?.line_1}
            <br />
            {shippingAddress?.city ?? shippingAddress?.county},{" "}
            {shippingAddress?.postcode} {shippingAddress?.country}
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="font-medium">Shipping status</span>
          <span>{shopperOrder?.raw.shipping}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="font-medium">Payment status</span>
          <span>{shopperOrder?.raw.payment}</span>
        </div>
      </div>
      <div className="flex self-stretch">
        <ul role="list" className="w-full border-b border-zinc-300">
          {productItems?.map((item) => (
            <li key={item.id}>
              <OrderLineItem
                orderItem={item}
                image={!!item.product_id ? images[item.product_id] : undefined}
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="flex self-stretch items-end flex-col gap-5">
        <div className="flex flex-col gap-2 w-[22.5rem]">
          <div className="flex justify-between items-baseline self-stretch">
            <span className="text-sm">Subtotal</span>
            <span className="font-medium">
              {shopperOrder?.raw.meta?.display_price?.without_tax?.formatted}
            </span>
          </div>
          <div className="flex justify-between items-baseline self-stretch">
            <span className="text-sm">Shipping</span>
            <span className="font-medium">
              {shippingItem?.meta?.display_price?.with_tax?.value?.formatted ??
                shopperOrder?.raw.meta?.display_price?.shipping?.formatted}
            </span>
          </div>
          {shopperOrder?.raw?.meta?.display_price?.discount?.amount! < 0 && (
            <div className="flex justify-between items-baseline self-stretch">
              <span className="text-sm">Discount</span>
              <span className="font-medium text-red-600">
                {shopperOrder?.raw?.meta?.display_price?.discount?.formatted}
              </span>
            </div>
          )}
          <div className="flex justify-between items-baseline self-stretch">
            <span className="text-sm">Sales Tax</span>
            <span className="font-medium">
              {shopperOrder?.raw?.meta?.display_price?.tax?.formatted}
            </span>
          </div>
        </div>
        <div className="w-[22.5rem] border-t border-zinc-300"></div>
        <div className="justify-between items-baseline flex w-[22.5rem]">
          <span>Total</span>
          <span className="font-medium">
            {shopperOrder?.raw?.meta?.display_price?.with_tax?.formatted}
          </span>
        </div>
      </div>
    </div>
  );
}
