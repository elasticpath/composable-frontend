import { notFound } from "next/navigation";
import { createAnAccessToken, getAnOrder } from "@epcc-sdk/sdks-shopper";
import { createElasticPathClient } from "../../../../../lib/create-elastic-path-client";
import { OrderConfirmation } from "../../OrderConfirmation";
import { TAGS } from "../../../../../lib/constants";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  if (!orderId) {
    notFound();
  }

  const client = createElasticPathClient();

  // Need client credentials to fetch the order items for anonymous orders
  const clientCredentialsResponse = await createAnAccessToken({
    client,
    body: {
      grant_type: "client_credentials",
      client_id: process.env.NEXT_PUBLIC_EPCC_CLIENT_ID!,
      client_secret: process.env.EPCC_CLIENT_SECRET!,
    },
  });

  if (!clientCredentialsResponse.data) {
    console.error(JSON.stringify(clientCredentialsResponse.error));
    throw new Error("Failed to get client credentials token");
  }

  // Fetch order details with items
  const orderResponse = await getAnOrder({
    client,
    headers: {
      Authorization: `Bearer ${clientCredentialsResponse.data.access_token}`,
    },
    path: {
      orderID: orderId,
    },
    query: {
      include: ["items"],
    },
    next: {
      tags: [TAGS.orders],
    },
  });

  if (!orderResponse.data?.data) {
    notFound();
  }

  const order = orderResponse.data.data;
  const orderItems = orderResponse.data.included?.items ?? [];

  return <OrderConfirmation order={order} orderItems={orderItems} />;
}
