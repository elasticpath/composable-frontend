import type { Gateway, Moltin } from "@moltin/sdk"
import { OperationResult } from "@elasticpath/composable-common"
import { updateManualGateway } from "./update-gateway"
import { processUnknownError } from "../../../../util/process-unknown-error"

export async function setupManualPaymentGateway(epccClient: Moltin): Promise<
  OperationResult<
    Gateway,
    {
      code: "manual_gateway_update_failed" | "unknown"
      message: string
    }
  >
> {
  try {
    /**
     * Update manual gateway to be enabled
     */
    const updateResult = await updateManualGateway(epccClient)

    if (!updateResult.success) {
      return {
        success: false,
        error: {
          code: "manual_gateway_update_failed",
          message: `Failed to update ep payment gateway. ${processUnknownError(
            updateResult,
          )}`,
        },
      }
    }

    return updateResult
  } catch (err: unknown) {
    const errorStr = processUnknownError(err)

    return {
      success: false,
      error: {
        code: "unknown",
        message: errorStr,
      },
    }
  }
}
