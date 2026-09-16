import { redirect } from "next/navigation"
import { getShopperSession } from "@/lib/account-session"
import { envRequirementProblems } from "@/lib/store-requirements"
import { LoginForm } from "./login-form"

export const dynamic = "force-dynamic"

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string }>
}) {
  // Signing in needs a password profile and a secret to sign the session with.
  // Checking here means a setup fault is never reported to the reader as a bad
  // password.
  if (envRequirementProblems(process.env).length > 0) {
    redirect("/configuration-error")
  }

  if (await getShopperSession()) {
    redirect("/saved-list")
  }

  const { returnUrl } = await searchParams

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-xl font-medium">Sign in</h1>
      <LoginForm returnUrl={returnUrl} />
    </div>
  )
}
