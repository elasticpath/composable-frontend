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

/**
 * Signs a shopper in and writes the session cookie.
 *
 * The account id in that cookie comes from Elastic Path's response to this
 * call, and is then sealed with an HMAC. It is the only account id the saved
 * list routes will ever act on, which is why nothing downstream has to trust
 * the browser.
 */
export async function login(formData: FormData) {
  const validated = loginSchema.safeParse(
    Object.fromEntries(formData.entries()),
  )

  if (!validated.success) {
    return { error: loginErrorMessage }
  }

  const { email, password, returnUrl } = validated.data

  // A store that cannot issue or sign a session is a setup problem, and must
  // never be reported to the reader as a wrong password. Checked before the
  // try below, so nothing about it is swallowed into the login error message.
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
      // No client code needs to read this, and nothing good comes of letting it.
      httpOnly: true,
      // `lax` keeps the cookie off cross-site POST and DELETE requests, so
      // another origin cannot drive the saved list routes on a signed-in
      // shopper's behalf.
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
