"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { postV2AccountMembersTokens } from "@epcc-sdk/sdks-shopper"
import { getImplicitAccessToken } from "@/lib/server-credentials"
import { safeReturnPath } from "@/lib/return-url"
import { signInWithPassword } from "@/lib/sign-in"
import { storeEnv } from "@/lib/store-env"
import { envRequirementProblems } from "@/lib/store-requirements"
import {
  ACCOUNT_ID_COOKIE_KEY,
  ACCOUNT_TOKEN_COOKIE_KEY,
  ACTIVE_CART_COOKIE_KEY,
} from "./constants"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  returnUrl: z.string().optional(),
})

const rejectedMessage =
  "Failed to sign in. Check your email address and password."
const noAccountMessage =
  "Your sign-in is not linked to an account, so there are no carts to show. Ask an administrator of your company's account to add you."
const unavailableMessage =
  "Sign in is unavailable right now. Try again in a moment."
const failureMessages = {
  rejected: rejectedMessage,
  unavailable: unavailableMessage,
  "no-account": noAccountMessage,
}

export async function login(formData: FormData) {
  const validated = loginSchema.safeParse(
    Object.fromEntries(formData.entries()),
  )

  if (!validated.success) {
    return { error: rejectedMessage }
  }

  if (envRequirementProblems(storeEnv()).length > 0) {
    redirect("/configuration-error")
  }

  const { email, password, returnUrl } = validated.data

  const result = await signInWithPassword(
    {
      email,
      password,
      passwordProfileId: process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID!,
    },
    {
      implicitToken: getImplicitAccessToken,
      requestToken: postV2AccountMembersTokens,
    },
  )

  if (!result.ok) {
    return { error: failureMessages[result.reason] }
  }

  const cookieStore = await cookies()
  const accountCookie = {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    expires: result.expires,
  }
  cookieStore.set({
    ...accountCookie,
    name: ACCOUNT_TOKEN_COOKIE_KEY,
    value: result.token,
  })
  cookieStore.set({
    ...accountCookie,
    name: ACCOUNT_ID_COOKIE_KEY,
    value: result.accountId,
  })
  cookieStore.delete(ACTIVE_CART_COOKIE_KEY)

  redirect(safeReturnPath(returnUrl))
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(ACCOUNT_TOKEN_COOKIE_KEY)
  cookieStore.delete(ACCOUNT_ID_COOKIE_KEY)
  cookieStore.delete(ACTIVE_CART_COOKIE_KEY)
  redirect("/login")
}
