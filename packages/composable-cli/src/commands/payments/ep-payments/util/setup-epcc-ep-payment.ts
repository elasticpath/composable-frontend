import { logging } from "@angular-devkit/core"
import type { Gateway, Moltin } from "@moltin/sdk"
import { OperationResult } from "@elasticpath/composable-common"
import { updateEpPaymentGateway } from "./update-gateway"
import { EpPaymentGatewaySettings } from "./ep-payments-schema"
import { processUnknownError } from "../../../../util/process-unknown-error"

export async function setupEPPaymentsPaymentGateway(
  sourceInput: EpPaymentGatewaySettings,
  epccClient: Moltin,
  logger: logging.LoggerApi,
): Promise<
  OperationResult<
    Gateway,
    {
      code: "ep_payments_gateway_update_failed" | "unknown"
      message: string
    }
  >
> {
  try {
    const { epPaymentsStripeAccountId } = sourceInput

    /**
     * Update ep payment gateway to be enabled with test mode on
     */
    const updateResult = await updateEpPaymentGateway(
      epccClient,
      epPaymentsStripeAccountId,
    )

    if (!updateResult.success) {
      logger.debug(`Failed to update ep payment gateway.`)
      return {
        success: false,
        error: {
          code: "ep_payments_gateway_update_failed",
          message: `Failed to update ep payment gateway. ${processUnknownError(
            updateResult,
          )}`,
        },
      }
    }

    return updateResult
  } catch (err: unknown) {
    const errorStr = processUnknownError(err)
    logger.error(errorStr)

    return {
      success: false,
      error: {
        code: "unknown",
        message: errorStr,
      },
    }
  }
}
