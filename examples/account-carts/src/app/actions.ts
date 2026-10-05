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
import { ACCOUNT_TOKEN_COOKIE_KEY, ACTIVE_CART_COOKIE_KEY } from "./constants"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  returnUrl: z.string().optional(),
})

const rejectedMessage =
  "Failed to sign in. Check your email address and password."
const unavailableMessage =
  "Sign in is unavailable right now. Try again in a moment."

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
    return {
      error:
        result.reason === "rejected" ? rejectedMessage : unavailableMessage,
    }
  }

  const cookieStore = await cookies()
  cookieStore.set({
    name: ACCOUNT_TOKEN_COOKIE_KEY,
    value: result.token,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: result.expires,
  })

  redirect(safeReturnPath(returnUrl))
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(ACCOUNT_TOKEN_COOKIE_KEY)
  cookieStore.delete(ACTIVE_CART_COOKIE_KEY)
  redirect("/login")
}
