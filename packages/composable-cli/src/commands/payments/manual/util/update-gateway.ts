import type { Gateway, Moltin as EpccClient } from "@moltin/sdk"
import { OperationResult } from "@elasticpath/composable-common"

const errMsg = "Failed to enable manual gateway."

export async function updateManualGateway(
  client: EpccClient,
): Promise<OperationResult<Gateway>> {
  try {
    const updatedGateway = await client.Gateways.Update("manual", {
      enabled: true,
    })

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
        }`,
      ),
    }
  }
}
