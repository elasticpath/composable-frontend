import type {ElasticPath } from "@elasticpath/js-sdk";

export async function gatewayCheck(client: ElasticPath): Promise<boolean> {
  try {
    const gateways = await client.Gateways.All();
    const epPaymentGateway = gateways.data.find(
      (gateway) => gateway.slug === "elastic_path_payments_stripe",
    )?.enabled;
    return !!epPaymentGateway;
  } catch (err) {
    return false;
  }
}
