import { logging } from "@angular-devkit/core"
import type { Moltin, PasswordProfile } from "@moltin/sdk"
import { OperationResult } from "@elasticpath/composable-common"
import { processUnknownError } from "../../../../util/process-unknown-error"
import { updateSettings } from "./update-settings"
import { createSelfSignupPasswordProfile } from "./create-self-signup-password-profile"

export async function setupSelfSignup(
  epccClient: Moltin,
  logger: logging.LoggerApi,
): Promise<
  OperationResult<
    PasswordProfile,
    {
      code: "self_signup_setup_failed" | "unknown"
      message: string
    }
  >
> {
  try {
    /**
     * TODO:
     *  - configure account settings
     *    - self-signup
     *    - auto create account for account members
     *    - Account Member self management
     *  - create a password profile
     *    - should have "email" for the username_format property
     *    - should have a predictable name
     */

    // Update account authentication settings
    const updateResult = await updateSettings(epccClient)

    if (!updateResult.success) {
      logger.debug(`Failed to update account authentication settings.`)
      return {
        success: false,
        error: {
          code: "self_signup_setup_failed",
          message: `Failed to setup ep self signup. ${processUnknownError(
            updateResult,
          )}`,
        },
      }
    }

    const accountAuthSettings =
      await epccClient.AccountAuthenticationSettings.Get()

    const profileCreationResult = await createSelfSignupPasswordProfile(
      epccClient,
      accountAuthSettings.data.relationships.authentication_realm.data.id,
    )

    if (!profileCreationResult.success) {
      logger.debug(`Failed to update account authentication settings.`)
      return {
        success: false,
        error: {
          code: "self_signup_setup_failed",
          message: `Failed to create password profile. ${processUnknownError(
            profileCreationResult,
          )}`,
        },
      }
    }

    return {
      success: true,
      data: profileCreationResult.data,
    }
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
