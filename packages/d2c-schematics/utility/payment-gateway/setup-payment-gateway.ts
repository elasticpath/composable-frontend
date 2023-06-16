import type { Schema as SetupPaymentGatewayOptions } from "../../../../dist-schema/packages/d2c-schematics/setup-payment-gateway/schema"
import { noop, Rule, Tree } from "@angular-devkit/schematics"
import { logging } from "@angular-devkit/core"
import ora from "ora"
import {
  epPaymentGatewaySettingsSchema,
  setupEPPaymentsPaymentGateway,
} from "@elasticpath/composable-common"

export async function setupEPPaymentGateway(
  options: SetupPaymentGatewayOptions,
  _host: Tree,
  logger: logging.LoggerApi
): Promise<Rule> {
  const spinner = ora({
    text: `Running EP Payment gateway setup...`,
    discardStdin: process.platform != "win32",
  }).start()

  const parsedOptionsResult = epPaymentGatewaySettingsSchema.safeParse(options)

  if (!parsedOptionsResult.success) {
    spinner.fail()
    return Promise.reject(parsedOptionsResult.error)
  }

  const parsedOptions = parsedOptionsResult.data

  const result = await setupEPPaymentsPaymentGateway(
    parsedOptions,
    logger as any
  )

  if (!result.success) {
    const errMsg = `Failed to setup ep payments gateway ${result.error.name} - ${result.error.message}`
    logger.error(errMsg)
    spinner.fail(errMsg)
    return Promise.reject(result)
  }

  spinner.succeed(
    `Success setting up EP Payments it is now enabled ${
      result.data.test ? "in test mode" : ""
    }`
  )
  spinner.stop()

  return noop()
}
