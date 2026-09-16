"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { postV2AccountMembersTokens } from "@epcc-sdk/sdks-shopper"
import { configureClient } from "../lib/api-client"
import { envRequirementProblems } from "../lib/store-requirements"
import { ACCOUNT_TOKEN_COOKIE_KEY } from "./constants"

configureClient()

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  returnUrl: z.string().optional(),
})

const loginErrorMessage =
  "Failed to sign in. Check your email address and password."

export async function login(formData: FormData) {
  const validated = loginSchema.safeParse(
    Object.fromEntries(formData.entries()),
  )

  if (!validated.success) {
    return { error: loginErrorMessage }
  }

  const { email, password, returnUrl } = validated.data

  const missing = envRequirementProblems(process.env)

  if (missing.length > 0) {
    redirect("/configuration-error")
  }

  const passwordProfileId = process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID!

  try {
    const result = await postV2AccountMembersTokens({
      body: {
        data: {
          type: "account_management_authentication_token",
          authentication_mechanism: "password",
          password_profile_id: passwordProfileId,
          username: email.toLowerCase(),
          password,
        },
      },
    })

    const member = result.data?.data?.[0]

    if (!member?.token || !member.expires) {
      return { error: loginErrorMessage }
    }

    const expires = new Date(member.expires)

    const cookieStore = await cookies()
    cookieStore.set({
      name: ACCOUNT_TOKEN_COOKIE_KEY,
      value: member.token,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires,
    })
  } catch (error) {
    console.error(error)
    return { error: loginErrorMessage }
  }

  redirect(returnUrl ?? "/saved-list")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(ACCOUNT_TOKEN_COOKIE_KEY)
  redirect("/")
}
