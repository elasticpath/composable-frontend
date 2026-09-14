import { redirect } from "next/navigation"
import { getShopperSession } from "@/lib/account-session"
import { LoginForm } from "./login-form"

export const dynamic = "force-dynamic"

export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ returnUrl?: string }>
}) {
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
