"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "./constants"
import { postV2AccountMembersTokens } from "@epcc-sdk/sdks-shopper"
import { configureClient } from "../lib/api-client"
import {
  requestPasswordResetToken,
  authenticateWithOneTimeToken,
  resetUserPassword,
} from "../lib/password-reset"

configureClient()

const PASSWORD_PROFILE_ID = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID || ""

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  returnUrl: z.string().optional(),
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
})

const loginErrorMessage =
  "Failed to login, make sure your email and password are correct"

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const resetPasswordSchema = z.object({
  password: z.string().min(8),
  token: z.string(),
  email: z.string().email(),
  profileInfoId: z.string(),
})

export async function login(formData: FormData) {
  const rawEntries = Object.fromEntries(formData.entries())
  const validatedProps = loginSchema.safeParse(rawEntries)

  if (!validatedProps.success) {
    return {
      error: loginErrorMessage,
    }
  }

  const { email, password, returnUrl } = validatedProps.data

  try {
    const result = await postV2AccountMembersTokens({
      body: {
        data: {
          type: "account_management_authentication_token",
          authentication_mechanism: "password",
          password_profile_id: PASSWORD_PROFILE_ID,
          username: email.toLowerCase(),
          password,
        },
      },
    })

    const cookieStore = await cookies()

    // Check if data exists and has at least one element
    if (
      !result.data?.data ||
      !Array.isArray(result.data.data) ||
      result.data.data.length === 0
    ) {
      return {
        error: loginErrorMessage,
      }
    }

    // Safely access the first item
    const memberData = result.data.data[0]
    if (!memberData) {
      return {
        error: loginErrorMessage,
      }
    }

    const tokenData = {
      token: memberData.account_id,
      // expires is a string in ISO format (e.g. '2025-05-08T16:23:40.901Z')
      // Convert it to a Unix timestamp (seconds since epoch)
      expires: memberData.expires
        ? Math.floor(new Date(memberData.expires).getTime() / 1000)
        : // Fallback: 24 hours from now if expires is missing
          Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000),
      email: email,
      name: memberData.account_name || "",
    }

    cookieStore.set({
      name: ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
      value: JSON.stringify(tokenData),
      path: "/",
      sameSite: "strict",
      expires: new Date(tokenData.expires * 1000),
    })
  } catch (error) {
    console.error(error)
    return {
      error: loginErrorMessage,
    }
  }

  redirect(returnUrl ?? "/")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(ACCOUNT_MEMBER_TOKEN_COOKIE_NAME)
  redirect("/")
}

export async function register(formData: FormData) {
  const validatedProps = registerSchema.safeParse(
    Object.fromEntries(formData.entries()),
  )

  if (!validatedProps.success) {
    return {
      error: "Invalid email, password, or name",
    }
  }

  const { email, password, name } = validatedProps.data

  try {
    const result = await postV2AccountMembersTokens({
      body: {
        data: {
          type: "account_management_authentication_token",
          authentication_mechanism: "self_signup",
          password_profile_id: PASSWORD_PROFILE_ID,
          username: email.toLowerCase(),
          password,
          name,
          email,
        },
      },
    })

    const cookieStore = await cookies()

    // Check if data exists and has at least one element
    if (
      !result.data?.data ||
      !Array.isArray(result.data.data) ||
      result.data.data.length === 0
    ) {
      console.error(result.error)
      return {
        error: "Failed to register",
      }
    }

    // Safely access the first item
    const memberData = result.data.data[0]
    if (!memberData) {
      return {
        error: "Failed to register",
      }
    }

    const tokenData = {
      token: memberData.account_id,
      // expires is a string in ISO format (e.g. '2025-05-08T16:23:40.901Z')
      // Convert it to a Unix timestamp (seconds since epoch)
      expires: memberData.expires
        ? Math.floor(new Date(memberData.expires).getTime() / 1000)
        : // Fallback: 24 hours from now if expires is missing
          Math.floor((Date.now() + 24 * 60 * 60 * 1000) / 1000),
      email: email,
      name: name,
    }

    cookieStore.set({
      name: ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
      value: JSON.stringify(tokenData),
      path: "/",
      sameSite: "strict",
      expires: new Date(tokenData.expires * 1000),
    })
  } catch (error) {
    console.error(error)
    return {
      error: "Failed to register",
    }
  }

  redirect("/")
}

export async function forgotPassword(formData: FormData) {
  const validatedProps = forgotPasswordSchema.safeParse(
    Object.fromEntries(formData.entries()),
  )

  if (!validatedProps.success) {
    return {
      error: "Please enter a valid email address",
    }
  }

  const { email } = validatedProps.data

  try {
    await requestPasswordResetToken(email)

    // In a real implementation, a webhook would send an email with the reset token
    // For demo purposes, we just return success

    return {
      success: true,
    }
  } catch (error) {
    console.error(error)
    // Don't reveal if email exists or not for security
    return {
      success: true,
    }
  }
}

export async function resetPassword(formData: FormData) {
  const validatedProps = resetPasswordSchema.safeParse(
    Object.fromEntries(formData.entries()),
  )

  if (!validatedProps.success) {
    return {
      error: "Invalid password. Must be at least 8 characters long.",
    }
  }

  const { password, token, email, profileInfoId } = validatedProps.data

  try {
    // Authenticate with the one-time password token
    const authResult = await authenticateWithOneTimeToken(email, token)

    // Verify that we have the authentication token in the response
    if (
      !authResult?.data?.data ||
      !Array.isArray(authResult.data.data) ||
      authResult.data.data.length === 0
    ) {
      return {
        error: "Invalid or expired token. Please try again.",
      }
    }

    const memberData = authResult.data.data[0]

    if (!memberData.token) {
      return {
        error: "Invalid or expired token. Please try again.",
      }
    }

    const authToken = memberData.token

    // Reset the password using the authentication token
    await resetUserPassword(profileInfoId, authToken, password, email)

    return {
      success: true,
    }
  } catch (error) {
    console.error(error)
    return {
      error: "Failed to reset password. Please try again.",
    }
  }
}
