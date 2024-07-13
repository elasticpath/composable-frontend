import type {
  AccountAuthenticationSettings,
  Moltin as EpccClient,
} from "@moltin/sdk"
import { OperationResult } from "@elasticpath/composable-common"

const errMsg = "Failed to enable manual gateway."

export async function updateSettings(
  client: EpccClient,
): Promise<OperationResult<AccountAuthenticationSettings>> {
  try {
    const updatedSettings = await client.AccountAuthenticationSettings.Update({
      type: "account_authentication_settings",
      enable_self_signup: true,
      auto_create_account_for_account_members: true,
      account_member_self_management: "update_only",
    })

    if (updatedSettings.data) {
      return {
        success: true,
        data: updatedSettings.data,
      }
    }

    return {
      success: false,
      error: new Error(`${errMsg} ${JSON.stringify(updatedSettings)}`),
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
