import { logging } from "@angular-devkit/core"
import type { Gateway, Moltin } from "@moltin/sdk"
import { checkGateway, OperationResult } from "@elasticpath/composable-common"
import { updateEpPaymentGateway } from "./update-gateway"
import { EpPaymentGatewaySettings } from "./ep-payments-schema"

export async function setupEPPaymentsPaymentGateway(
  sourceInput: EpPaymentGatewaySettings,
  epccClient: Moltin,
  logger: logging.LoggerApi,
): Promise<OperationResult<Gateway>> {
  try {
    const { epPaymentsStripeAccountId } = sourceInput

    /**
     * Check if EP payments is enabled and do nothing if it is
     */
    const checkGatewayResult = await checkGateway(
      epccClient,
      "elastic_path_payments_stripe",
    )

    if (checkGatewayResult.success) {
      logger.debug(`EP Payment gateway is already enabled`)
      return checkGatewayResult
    }

    /**
     * Update ep payment gateway to be enabled with test mode on
     */
    const updateResult = await updateEpPaymentGateway(
      epccClient,
      epPaymentsStripeAccountId,
    )

    if (!updateResult.success) {
      logger.debug(`Failed to update ep payment gateway.`)
      return updateResult
    }

    return updateResult
  } catch (err: unknown) {
    const errorStr = `An unknown error occurred: ${
      err instanceof Error
        ? `${err.name} = ${err.message}`
        : JSON.stringify(err)
    }`

    logger.error(errorStr)

    return {
      success: false,
      error: new Error(errorStr),
    }
  }
}
