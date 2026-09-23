import { configureClient } from "./api-client"
import {
  client,
  postV2AccountMembersTokens,
  updatePasswordProfileInfo,
  createOneTimePasswordTokenRequest,
} from "@epcc-sdk/sdks-shopper"

// Base API URL from environment
const PASSWORD_PROFILE_ID = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID || ""

// Configure the client to use for any API requests
configureClient()

type AccountAuthenticationSettings = {
  data?: {
    relationships?: {
      authentication_realm?: { data?: { id?: string } }
    }
  }
}

/**
 * Get the ID of the store's account authentication realm.
 * The realms API takes the realm's UUID, so it is read from the store's
 * account authentication settings.
 */
async function getAuthenticationRealmId(): Promise<string> {
  const { data } = await client.get<AccountAuthenticationSettings>({
    url: "/v2/settings/account-authentication",
  })
  const realmId = data?.data?.relationships?.authentication_realm?.data?.id

  if (!realmId) {
    throw new Error("Store has no account authentication realm")
  }

  return realmId
}

/**
 * Request a password reset token
 * @param email User's email address
 * @returns Response data or error
 */
export async function requestPasswordResetToken(email: string) {
  try {
    const realmId = await getAuthenticationRealmId()
    const response = await createOneTimePasswordTokenRequest({
      path: {
        realmId,
        profileId: PASSWORD_PROFILE_ID,
      },
      body: {
        data: {
          type: "one_time_password_token_request",
          username: email.toLowerCase(),
          purpose: "reset_password",
        },
      },
    })

    if (!response) {
      throw new Error("Failed to request password reset token")
    }

    return response
  } catch (error) {
    console.error("Error requesting password reset token:", error)
    throw error
  }
}

/**
 * Authenticate using a one-time password token
 * @param email User's email
 * @param token One-time password token
 * @returns Authentication token response
 */
export async function authenticateWithOneTimeToken(
  email: string,
  token: string,
) {
  try {
    const response = await postV2AccountMembersTokens({
      body: {
        data: {
          type: "account_management_authentication_token",
          authentication_mechanism: "passwordless",
          password_profile_id: PASSWORD_PROFILE_ID,
          username: email.toLowerCase(),
          one_time_password_token: token,
        },
      },
    })

    if (!response.data) {
      throw new Error(`Failed to authenticate with token`)
    }

    return response
  } catch (error) {
    console.error("Error authenticating with one-time token:", error)
    throw error
  }
}

/**
 * Reset user password
 * The three IDs come from the one-time password token webhook payload.
 * @param realmId Authentication realm ID (`authentication_realm_id`)
 * @param userAuthInfoId User authentication info ID (`user_authentication_info.id`)
 * @param passwordProfileInfoId User authentication password profile info ID (`user_authentication_password_profile_info.id`)
 * @param authToken Account management authentication token
 * @param newPassword New password
 * @returns Response data or error
 */
export async function resetUserPassword(
  realmId: string,
  userAuthInfoId: string,
  passwordProfileInfoId: string,
  authToken: string,
  newPassword: string,
) {
  try {
    const response = await updatePasswordProfileInfo({
      path: {
        realmId,
        userAuthInfoId,
        passwordProfileInfoId,
      },
      body: {
        data: {
          id: passwordProfileInfoId,
          type: "user_authentication_password_profile_info",
          password: newPassword,
        },
      },
      headers: {
        "EP-Account-Management-Authentication-Token": authToken,
      },
    })

    if (!response.data) {
      throw new Error("Failed to reset password")
    }

    return response
  } catch (error) {
    console.error("Error resetting password:", error)
    throw error
  }
}
