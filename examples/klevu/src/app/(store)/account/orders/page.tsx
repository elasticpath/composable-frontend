import { cookies } from "next/headers";
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../../../../lib/cookie-constants";
import { redirect } from "next/navigation";
import { getServerSideImplicitClient } from "../../../../lib/epcc-server-side-implicit-client";
import {
  Order,
  OrderItem,
  RelationshipToMany,
  ResourcePage,
} from "@elasticpath/js-sdk";
import {
  getSelectedAccount,
  retrieveAccountMemberCredentials,
} from "../../../../lib/retrieve-account-member-credentials";
import { ResourcePagination } from "../../../../components/pagination/ResourcePagination";
import { DEFAULT_PAGINATION_LIMIT } from "../../../../lib/constants";
import { OrderItemWithDetails } from "./OrderItemWithDetails";

export const dynamic = "force-dynamic";

export default async function Orders({
  searchParams,
}: {
  searchParams?: {
    limit?: string;
    offset?: string;
    page?: string;
  };
}) {
  const currentPage = Number(searchParams?.page) || 1;
  const limit = Number(searchParams?.limit) || DEFAULT_PAGINATION_LIMIT;
  const offset = Number(searchParams?.offset) || 0;

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

  const result: Awaited<ReturnType<typeof client.Orders.All>> =
    await client.request.send(
      `/orders?include=items&page[limit]=${limit}&page[offset]=${offset}`,
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

  const mappedOrders = result.included
    ? resolveShopperOrder(result.data, result.included)
    : [];

  const totalPages = Math.ceil(result.meta.results.total / limit);

  return (
    <div className="flex flex-col gap-5 items-start w-full">
      <div className="flex self-stretch">
        <h1 className="text-2xl">Order history</h1>
      </div>
      <div className="flex self-stretch">
        <ul role="list">
          {mappedOrders.map(({ raw: order, items }) => (
            <li key={order.id}>
              <OrderItemWithDetails order={order} orderItems={items} />
            </li>
          ))}
        </ul>
      </div>
      <div className="flex self-stretch">
        <ResourcePagination totalPages={totalPages} />
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
  data: Order[],
  included: NonNullable<
    ResourcePage<Order, { items: OrderItem[] }>["included"]
  >,
): { raw: Order; items: OrderItem[] }[] {
  // Create a map of included items by their id
  const itemMap = included.items.reduce(
    (acc, item) => {
      return { ...acc, [item.id]: item };
    },
    {} as Record<string, OrderItem>,
  );

  // Map the items in the data array to their corresponding included items
  return data.map((order) => {
    const orderItems = order.relationships?.items?.data
      ? resolveOrderItemsFromRelationship(
          order.relationships.items.data,
          itemMap,
        )
      : [];

    return {
      raw: order,
      items: orderItems,
    };
  });
}
