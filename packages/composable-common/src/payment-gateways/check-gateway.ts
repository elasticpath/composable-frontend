import type { Gateway, Moltin as EpccClient } from "@moltin/sdk"
import type { OperationResult } from "../types"

export async function checkGateway(
  client: EpccClient,
  gatewaySlug: string,
): Promise<OperationResult<Gateway>> {
  const gateways = await client.Gateways.All()
  const epPaymentGateway = gateways.data.find((x) => x.slug === gatewaySlug)

  if (epPaymentGateway && epPaymentGateway.enabled) {
    return {
      success: true,
      data: epPaymentGateway,
    }
  }

  return {
    success: false,
    error: new Error(`${gatewaySlug} gateway is not enabled`),
  }
}
