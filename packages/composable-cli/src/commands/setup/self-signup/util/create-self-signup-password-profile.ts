import type { Moltin as EpccClient, PasswordProfile } from "@moltin/sdk"
import { OperationResult } from "@elasticpath/composable-common"

const errMsg = "Failed to enable manual gateway."

export async function createSelfSignupPasswordProfile(
  client: EpccClient,
  realmId: string,
): Promise<OperationResult<PasswordProfile>> {
  try {
    const result = await client.PasswordProfile.Create(realmId, {
      data: {
        type: "password_profile",
        username_format: "email",
        name: "password profile",
        // @ts-ignore TODO: add to js-sdk types
        enable_one_time_password_token: true,
      },
    })

    if (result.data) {
      return {
        success: true,
        data: result.data,
      }
    }

    return {
      success: false,
      error: new Error(`${errMsg} ${JSON.stringify(result)}`),
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
