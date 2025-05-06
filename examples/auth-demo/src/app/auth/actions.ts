"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createElasticPathClient } from "@/lib/create-elastic-path-client"
import { postV2AccountMembersTokens } from "@epcc-sdk/sdks-shopper"
import { createCookieFromTokenResponse } from "@/lib/create-cookie-from-token-response"
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "@/lib/constants"
import { getErrorMessage } from "@/lib/get-error-message"

// Schema for login validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  returnUrl: z.string().optional(),
})

// Schema for registration validation
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string(),
})

const PASSWORD_PROFILE_ID = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID!
const loginErrorMessage =
  "Failed to login, make sure your email and password are correct"

export async function login(formData: FormData) {
  const client = createElasticPathClient()
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
      client,
      body: {
        data: {
          type: "account_management_authentication_token",
          authentication_mechanism: "password",
          password_profile_id: PASSWORD_PROFILE_ID,
          username: email.toLowerCase(), // Lowercase the username to avoid case sensitivity issues
          password,
        },
      },
    })

    const cookieStore = await cookies()

    if (!result.data) {
      return {
        error: loginErrorMessage,
      }
    }

    cookieStore.set(createCookieFromTokenResponse(result.data))
  } catch (error) {
    console.error(getErrorMessage(error))
    return {
      error: loginErrorMessage,
    }
  }

  redirect(returnUrl ?? "/dashboard")
}

export async function logout() {
  const cookieStore = cookies()
  cookieStore.delete(ACCOUNT_MEMBER_TOKEN_COOKIE_NAME)
  redirect("/")
}

export async function register(formData: FormData) {
  const client = createElasticPathClient()
  const rawEntries = Object.fromEntries(formData.entries())
  const validatedProps = registerSchema.safeParse(rawEntries)

  if (!validatedProps.success) {
    return {
      error: "Invalid email, password, or name",
    }
  }

  const { email, password, name } = validatedProps.data

  try {
    const result = await postV2AccountMembersTokens({
      client,
      body: {
        data: {
          type: "account_management_authentication_token",
          authentication_mechanism: "self_signup",
          password_profile_id: PASSWORD_PROFILE_ID,
          username: email.toLowerCase(), // Lowercase the username to avoid case sensitivity issues
          password,
          name,
          email,
        },
      },
    })

    const cookieStore = cookies()

    if (!result.data) {
      return {
        error: "Failed to register",
      }
    }

    cookieStore.set(createCookieFromTokenResponse(result.data))
  } catch (error) {
    console.error(getErrorMessage(error))
    return {
      error: "Failed to register",
    }
  }

  redirect("/dashboard")
}
