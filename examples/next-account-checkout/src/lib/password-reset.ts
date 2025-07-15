import { configureClient } from "./api-client"
import {
  postV2AccountMembersTokens,
  updatePasswordProfileInfo,
  createOneTimePasswordTokenRequest,
} from "@epcc-sdk/sdks-shopper"

// Base API URL from environment
const PASSWORD_PROFILE_ID = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID || ""

// Configure the client to use for any API requests
configureClient()

/**
 * Request a password reset token
 * @param email User's email address
 * @returns Response data or error
 */
export async function requestPasswordResetToken(email: string) {
  try {
    const response = await createOneTimePasswordTokenRequest({
      path: {
        realmId: "shopper", // Using the shopper realm
        passwordProfileId: PASSWORD_PROFILE_ID,
      },
      body: {
        type: "one_time_password_token_request",
        username: email.toLowerCase(),
        purpose: "reset_password",
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
 * @param profileInfoId User authentication password profile info ID
 * @param authToken Account management authentication token
 * @param newPassword New password
 * @param email User's email address needed for the username field
 * @returns Response data or error
 */
export async function resetUserPassword(
  profileInfoId: string,
  authToken: string,
  newPassword: string,
  email: string,
) {
  try {
    const response = await updatePasswordProfileInfo({
      path: {
        realmId: "shopper", // Using the shopper realm
        userAuthenticationInfoId: profileInfoId, // Using profileInfoId as userAuthenticationInfoId
        userAuthenticationPasswordProfileInfoId: profileInfoId, // Using the same ID
      },
      body: {
        data: {
          id: profileInfoId,
          type: "user_authentication_password_profile_info",
          username: email.toLowerCase(),
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

/**
 * Function to simulate a webhook for sending password reset email
 * In a real implementation, this would be an API endpoint that receives webhook events
 *
 * @param token The one-time password token
 * @param email User's email
 * @param profileInfoId User authentication password profile info ID
 */
export function simulatePasswordResetEmail(
  token: string,
  email: string,
  profileInfoId: string,
) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  console.log(`
    [SIMULATED PASSWORD RESET EMAIL]
    To: ${email}
    Subject: Reset Your Password
    
    Hello,
    
    You requested to reset your password. Please click the link below or copy and paste it into your browser:
    
    ${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(
      email,
    )}&profileInfoId=${profileInfoId}
    
    If you did not request this password reset, please ignore this email.
    
    Thank you,
    Shopper Store Team
  `)
}
