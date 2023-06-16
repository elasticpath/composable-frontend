import { logging } from "@angular-devkit/core"
import type { EpPaymentGatewaySettings } from "./ep-payments-schema"
import type { Gateway } from "@moltin/sdk"
import { OperationResult } from "../../types"
import { createEpccClient } from "../../integration-hub"
import { checkGateway } from "../check-gateway"
import { updateEpPaymentGateway } from "./update-gateway"

export async function setupEPPaymentsPaymentGateway(
  sourceInput: Omit<EpPaymentGatewaySettings, "gatewayName">,
  logger: logging.LoggerApi
): Promise<OperationResult<Gateway>> {
  try {
    const {
      epccConfig: {
        host: epccHost,
        clientId: epccClientId,
        clientSecret: epccClientSecret,
      },
      epPaymentsStripeAccountId,
    } = sourceInput
    const epccClient = createEpccClient({
      host: epccHost,
      client_id: epccClientId,
      client_secret: epccClientSecret,
    })

    /**
     * Check if EP payments is enabled and do nothing if it is
     */
    const checkGatewayResult = await checkGateway(
      epccClient,
      "elastic_path_payments_stripe"
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
      epPaymentsStripeAccountId
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
