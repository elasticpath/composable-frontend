import type { Gateway, Moltin as EpccClient } from "@moltin/sdk"
import { OperationResult } from "../../types"

const errMsg = "Failed to enable elastic_path_payments_stripe gateway."

export async function updateEpPaymentGateway(
  client: EpccClient,
  accountId: string
): Promise<OperationResult<Gateway>> {
  try {
    const updatedGateway = await client.Gateways.Update(
      "elastic_path_payments_stripe",
      { enabled: true, stripe_account: accountId, test: true }
    )

    if (updatedGateway.data) {
      return {
        success: true,
        data: updatedGateway.data,
      }
    }

    return {
      success: false,
      error: new Error(`${errMsg} ${JSON.stringify(updatedGateway)}`),
    }
  } catch (err: unknown) {
    return {
      success: false,
      error: new Error(
        `${errMsg} An unknown error occurred ${
          err instanceof Error
            ? `${err.name} - ${err.message}`
            : "Failed to render error."
        }`
      ),
    }
  }
}
