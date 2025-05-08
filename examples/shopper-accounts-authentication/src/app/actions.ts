"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "./constants"
import { postV2AccountMembersTokens } from "@epcc-sdk/sdks-shopper"
import { configureClient } from "../lib/api-client"

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
