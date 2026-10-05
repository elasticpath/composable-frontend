import { redirect } from "next/navigation"
import { getShopperSession } from "@/lib/account-session"
import { safeReturnPath } from "@/lib/return-url"
import { storeEnv } from "@/lib/store-env"
import { envRequirementProblems } from "@/lib/store-requirements"
import { LoginForm } from "./login-form"

export const dynamic = "force-dynamic"

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string }>
}) {
  if (envRequirementProblems(storeEnv()).length > 0) {
    redirect("/configuration-error")
  }

  const { returnUrl } = await searchParams

  if (await getShopperSession()) {
    redirect(safeReturnPath(returnUrl))
  }

  return (
    <div className="mx-auto max-w-sm space-y-6">
      <h1 className="text-xl font-medium">Sign in</h1>
      <LoginForm returnUrl={returnUrl} />
    </div>
  )
}
