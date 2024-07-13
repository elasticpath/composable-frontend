import { logging } from "@angular-devkit/core"
import type { EpPaymentGatewaySettings } from "./ep-payments-schema"
import type { Gateway } from "@moltin/sdk"
import { OperationResult } from "../../types"
import { createEpccClient } from "../../integration-hub"
import { updateEpPaymentGateway } from "./update-gateway"

export async function setupEPPaymentsPaymentGateway(
  sourceInput: Omit<EpPaymentGatewaySettings, "gatewayName">,
  logger: logging.LoggerApi,
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
