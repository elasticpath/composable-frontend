import { redirect } from "next/navigation"
import { isAccountMemberAuthenticated } from "@/lib/is-account-member-authenticated"

export default function HomePage() {
  // Check if user is authenticated
  if (isAccountMemberAuthenticated()) {
    redirect("/dashboard")
  } else {
    redirect("/auth/login")
  }

  // This will never render, but TypeScript expects a return value
  return null
}
