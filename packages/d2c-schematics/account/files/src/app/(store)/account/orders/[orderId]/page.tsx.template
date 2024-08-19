import { cookies } from "next/headers";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../../../lib/cookie-constants";
import { notFound, redirect } from "next/navigation";
import { getServerSideImplicitClient } from "../../../../../lib/epcc-server-side-implicit-client";
import {
  Order as OrderType,
  OrderIncluded,
  OrderItem,
  RelationshipToMany,
} from "@elasticpath/js-sdk";
import {
  getSelectedAccount,
  retrieveAccountMemberCredentials,
} from "../../../../../lib/retrieve-account-member-credentials";
import { Button } from "../../../../../components/button/Button";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { formatIsoDateString } from "../../../../../lib/format-iso-date-string";
import { OrderLineItem } from "./OrderLineItem";

export const dynamic = "force-dynamic";

export default async function Order({
  params,
}: {
  params: { orderId: string };
}) {
  const cookieStore = cookies();

  const accountMemberCookie = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCookie) {
    return redirect("/login");
  }

  const selectedAccount = getSelectedAccount(accountMemberCookie);

  const client = getServerSideImplicitClient();

  let result: Awaited<ReturnType<typeof client.Orders.Get>> | undefined =
    undefined;
  try {
    result = await client.request.send(
      `/orders/${params.orderId}?include=items`,
      "GET",
      null,
      undefined,
      client,
      undefined,
      "v2",
      {
        "EP-Account-Management-Authentication-Token": selectedAccount.token,
      },
    );
  } catch (e: any) {
    if (
      "errors" in e &&
      (e.errors as any)[0].detail === "The order does not exist"
    ) {
      notFound();
    }
    throw e;
  }

  const shopperOrder = result!.included
    ? resolveShopperOrder(result!.data, result!.included)
    : { raw: result!.data, items: [] };

  const shippingAddress = shopperOrder.raw.shipping_address;

  const productItems = shopperOrder.items.filter(
    (item) =>
      item.unit_price.amount >= 0 && !item.sku.startsWith("__shipping_"),
  );
  const shippingItem = shopperOrder.items.find((item) =>
    item.sku.startsWith("__shipping_"),
  );

  return (
    <div className="flex flex-col gap-5 items-start w-full">
      <div className="flex self-stretch">
        <Button variant="secondary" size="medium" asChild>
          <Link href="/account/orders">
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to orders
          </Link>
        </Button>
      </div>
      <div className="w-full border-t border-zinc-300"></div>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl">Order # {shopperOrder.raw.id}</h1>
          <time dateTime={shopperOrder.raw.meta.timestamps.created_at}>
            {formatIsoDateString(shopperOrder.raw.meta.timestamps.created_at)}
          </time>
        </div>
      </div>
      <div className="flex py-4 self-stretch justify-between">
        <div className="flex flex-col gap-2.5">
          <span className="font-medium">Shipping address</span>
          <p translate="no">
            {shippingAddress.first_name} {shippingAddress.last_name}
            <br />
            {shippingAddress.line_1}
            <br />
            {shippingAddress.city ?? shippingAddress.county},{" "}
            {shippingAddress.postcode} {shippingAddress.country}
          </p>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="font-medium">Shipping status</span>
          <span>{shopperOrder.raw.shipping}</span>
        </div>
        <div className="flex flex-col gap-2.5">
          <span className="font-medium">Payment status</span>
          <span>{shopperOrder.raw.payment}</span>
        </div>
      </div>
      <div className="flex self-stretch">
        <ul role="list" className="w-full border-b border-zinc-300">
          {productItems.map((item) => (
            <li key={item.id}>
              <OrderLineItem orderItem={item} />
            </li>
          ))}
        </ul>
      </div>
      <div className="flex self-stretch items-end flex-col gap-5">
        <div className="flex flex-col gap-2 w-[22.5rem]">
          <div className="flex justify-between items-baseline self-stretch">
            <span className="text-sm">Subtotal</span>
            <span className="font-medium">
              {shopperOrder.raw.meta.display_price.without_tax.formatted}
            </span>
          </div>
          <div className="flex justify-between items-baseline self-stretch">
            <span className="text-sm">Shipping</span>
            <span className="font-medium">
              {shippingItem?.meta?.display_price?.with_tax?.value.formatted ??
                shopperOrder.raw.meta.display_price.shipping.formatted}
            </span>
          </div>
          {shopperOrder.raw.meta.display_price.discount.amount < 0 && (
            <div className="flex justify-between items-baseline self-stretch">
              <span className="text-sm">Discount</span>
              <span className="font-medium text-red-600">
                {shopperOrder.raw.meta.display_price.discount.formatted}
              </span>
            </div>
          )}
          <div className="flex justify-between items-baseline self-stretch">
            <span className="text-sm">Sales Tax</span>
            <span className="font-medium">
              {shopperOrder.raw.meta.display_price.tax.formatted}
            </span>
          </div>
        </div>
        <div className="w-[22.5rem] border-t border-zinc-300"></div>
        <div className="justify-between items-baseline flex w-[22.5rem]">
          <span>Total</span>
          <span className="font-medium">
            {shopperOrder.raw.meta.display_price.with_tax.formatted}
          </span>
        </div>
      </div>
    </div>
  );
}

function resolveOrderItemsFromRelationship(
  itemRelationships: RelationshipToMany<"item">["data"],
  itemMap: Record<string, OrderItem>,
): OrderItem[] {
  return itemRelationships.reduce((orderItems, itemRel) => {
    const includedItem: OrderItem | undefined = itemMap[itemRel.id];
    return [...orderItems, ...(includedItem && [includedItem])];
  }, [] as OrderItem[]);
}

function resolveShopperOrder(
  order: OrderType,
  included: NonNullable<OrderIncluded>,
): { raw: OrderType; items: OrderItem[] } {
  // Create a map of included items by their id
  const itemMap = included.items
    ? included.items.reduce(
        (acc, item) => {
          return { ...acc, [item.id]: item };
        },
        {} as Record<string, OrderItem>,
      )
    : {};

  // Map the items in the data array to their corresponding included items
  const orderItems = order.relationships?.items?.data
    ? resolveOrderItemsFromRelationship(order.relationships.items.data, itemMap)
    : [];

  return {
    raw: order,
    items: orderItems,
  };
}
