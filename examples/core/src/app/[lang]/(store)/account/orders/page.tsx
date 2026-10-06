import { cookies } from "next/headers";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "src/lib/cookie-constants";
import { redirect } from "next/navigation";
import { retrieveAccountMemberCredentials } from "src/lib/retrieve-account-member-credentials";
import { ResourcePagination } from "src/components/pagination/ResourcePagination";
import { DEFAULT_PAGINATION_LIMIT } from "src/lib/constants";
import { OrderItemWithDetails } from "./OrderItemWithDetails";
import { createElasticPathClient } from "src/lib/create-elastic-path-client";
import {
  getByContextAllProducts,
  getCustomerOrders,
} from "@epcc-sdk/sdks-shopper";
import { extractCartItemProductIds } from "src/lib/extract-cart-item-product-ids";
import { extractCartItemMedia } from "../../../(checkout)/checkout/extract-cart-item-media";
import { resolveShopperOrder } from "./resolve-shopper-order";
import { Alert, AlertDescription, AlertTitle } from "src/components/alert/Alert";
import {
  OrderFilter,
  orderFilterFromSearchParam,
  orderListApiFilter,
} from "src/lib/order-filter";
import { OrderFilterNav } from "./OrderFilterNav";

export const dynamic = "force-dynamic";

const EMPTY_LIST_MESSAGES: Record<OrderFilter, string> = {
  all: "You have no orders yet.",
  complete: "You have no complete orders.",
  "payment-pending": "You have no orders waiting on payment.",
};

export default async function Orders(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
  params?: Promise<{ lang: string }>;
}) {
  const searchParams = (await props.searchParams) ?? {};
  const limit = Number(searchParams.limit) || DEFAULT_PAGINATION_LIMIT;
  const offset = Number(searchParams.offset) || 0;
  const filter = orderFilterFromSearchParam(searchParams.filter);
  const apiFilter = orderListApiFilter(filter);

  const params = await props.params;
  const lang = params?.lang;

  const cookieStore = await cookies();

  const accountMemberCookie = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCookie) {
    return redirect(lang ? `/${lang}/login` : "/login");
  }

  const client = await createElasticPathClient();

  const result = await getCustomerOrders({
    client,
    query: {
      include: ["items"],
      "page[limit]": limit,
      "page[offset]": offset,
      ...(apiFilter && { filter: apiFilter }),
    },
  });

  const heading = (
    <div className="flex flex-col gap-4 self-stretch">
      <h1 className="text-2xl">Order history</h1>
      <OrderFilterNav selected={filter} searchParams={searchParams} />
    </div>
  );

  if (result.error || !result.data?.data) {
    return (
      <div className="flex flex-col gap-5 items-start w-full">
        {heading}
        <Alert variant="destructive">
          <AlertTitle>We couldn&apos;t load your orders</AlertTitle>
          <AlertDescription>
            Something went wrong on our side. Try again in a moment.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const items = result.data.included?.items ?? [];

  const productIds = extractCartItemProductIds(items);

  const productsResponse = productIds
    ? await getByContextAllProducts({
        client,
        query: {
          filter: `in(id,${productIds})`,
          include: ["main_image"],
        },
      })
    : undefined;

  const products = productsResponse?.error
    ? undefined
    : productsResponse?.data;

  const images = extractCartItemMedia({
    items,
    products: products?.data ?? [],
    mainImages: products?.included?.main_images ?? [],
  });

  const mappedOrders = resolveShopperOrder(result.data.data, items, images);

  const totalResults = result.data.meta?.results?.total
    ? Number(result.data.meta?.results?.total)
    : 0;
  const totalPages = Math.ceil(totalResults / limit);

  return (
    <div className="flex flex-col gap-5 items-start w-full">
      {heading}
      <div className="flex self-stretch">
        {mappedOrders.length === 0 ? (
          <p>{EMPTY_LIST_MESSAGES[filter]}</p>
        ) : (
          <ul role="list" className="w-full">
            {mappedOrders.map(({ raw: order, items, mainImage }) => (
              <li key={order.id}>
                <OrderItemWithDetails
                  order={order}
                  orderItems={items}
                  imageUrl={mainImage}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="flex self-stretch">
        <ResourcePagination totalPages={totalPages} />
      </div>
    </div>
  );
}
