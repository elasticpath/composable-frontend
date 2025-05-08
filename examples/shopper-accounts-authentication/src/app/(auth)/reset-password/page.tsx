import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { isAccountMemberAuthenticated } from "../../../lib/auth"
import { ResetPasswordForm } from "./ResetPasswordForm"

export default async function ResetPassword(props: {
  searchParams: { token?: string; email?: string; profileInfoId?: string }
}) {
  const { token, email, profileInfoId } = props.searchParams
  const cookieStore = await cookies()

  // Redirect if user is already authenticated
  if (isAccountMemberAuthenticated(cookieStore)) {
    redirect("/account")
  }

  // If required params are missing, redirect to forgot password page
  if (!token || !email || !profileInfoId) {
    redirect("/forgot-password")
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Link href="/" className="flex justify-center">
          <h1 className="text-2xl font-bold text-blue-600">Shopper Store</h1>
        </Link>
        <h2 className="mt-10 text-center text-2xl font-medium leading-9 tracking-tight text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter a new password for your account
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <ResetPasswordForm
          token={token}
          email={email}
          profileInfoId={profileInfoId}
        />
      </div>
    </div>
  )
}
