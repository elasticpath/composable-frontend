import { cookies } from "next/headers";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../../lib/cookie-constants";
import { notFound, redirect } from "next/navigation";
import { retrieveAccountMemberCredentials } from "../../../../lib/retrieve-account-member-credentials";
import { ResourcePagination } from "../../../../components/pagination/ResourcePagination";
import { DEFAULT_PAGINATION_LIMIT, TAGS } from "../../../../lib/constants";
import { OrderItemWithDetails } from "./OrderItemWithDetails";
import { createElasticPathClient } from "../../../../lib/create-elastic-path-client";
import {
  getByContextAllProducts,
  getCustomerOrders,
  CartItemResponse,
} from "@epcc-sdk/sdks-shopper";
import { extractCartItemProductIds } from "../../../../lib/extract-cart-item-product-ids";
import { extractCartItemMedia } from "../../../(checkout)/checkout/extract-cart-item-media";
import { resolveShopperOrder } from "./resolve-shopper-order";

export const dynamic = "force-dynamic";

export default async function Orders(props: {
  searchParams?: Promise<{
    limit?: string;
    offset?: string;
    page?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const limit = Number(searchParams?.limit) || DEFAULT_PAGINATION_LIMIT;
  const offset = Number(searchParams?.offset) || 0;

  const cookieStore = await cookies();

  const accountMemberCookie = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  );

  if (!accountMemberCookie) {
    return redirect("/login");
  }

  const client = await createElasticPathClient();

  const result = await getCustomerOrders({
    client,
    query: {
      include: "items",
      "page[limit]": BigInt(limit),
      "page[offset]": BigInt(offset),
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
    (result.data.included?.items as CartItemResponse[]) ?? [],
  );

  const productsResponse = await getByContextAllProducts({
    client,
    query: {
      filter: `in(id,${productIds})`,
      include: ["main_images"],
    },
    next: {
      tags: [TAGS.orders],
    },
  });

  const images = extractCartItemMedia({
    items: (items ?? []) as CartItemResponse[],
    products: productsResponse.data?.data ?? [],
    mainImages: productsResponse.data?.included?.main_images ?? [],
  });

  const mappedOrders = items
    ? resolveShopperOrder(result.data.data, items, images)
    : [];

  const totalResults = result.data.meta?.results?.total
    ? Number(result.data.meta?.results?.total)
    : 0;
  const totalPages = Math.ceil(totalResults / limit);

  return (
    <div className="flex flex-col gap-5 items-start w-full">
      <div className="flex self-stretch">
        <h1 className="text-2xl">Order history</h1>
      </div>
      <div className="flex self-stretch">
        {mappedOrders.length === 0 ? (
          <span>No orders</span>
        ) : (
          <ul role="list">
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
