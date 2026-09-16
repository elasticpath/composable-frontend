"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { postV2AccountMembersTokens } from "@epcc-sdk/sdks-shopper"
import { configureClient } from "../lib/api-client"
import { createSessionCookieValue } from "../lib/session"
import { envRequirementProblems } from "../lib/store-requirements"
import { SESSION_COOKIE_KEY, SESSION_LIFETIME_SECONDS } from "./constants"

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
  const sessionSecret = process.env.SESSION_SECRET!

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

    if (!member?.account_id) {
      return { error: loginErrorMessage }
    }

    const expires = Math.floor(Date.now() / 1000) + SESSION_LIFETIME_SECONDS

    const cookieStore = await cookies()
    cookieStore.set({
      name: SESSION_COOKIE_KEY,
      value: createSessionCookieValue(
        {
          accountId: member.account_id,
          accountName: member.account_name ?? "",
          email,
          expires,
        },
        sessionSecret,
      ),
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: new Date(expires * 1000),
    })
  } catch (error) {
    console.error(error)
    return { error: loginErrorMessage }
  }

  redirect(returnUrl ?? "/saved-list")
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_KEY)
  redirect("/")
}
