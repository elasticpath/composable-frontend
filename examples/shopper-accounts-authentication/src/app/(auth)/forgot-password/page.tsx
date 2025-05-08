import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { isAccountMemberAuthenticated } from "../../../lib/auth"
import { ForgotPasswordForm } from "./ForgotPasswordForm"

export default async function ForgotPassword() {
  const cookieStore = await cookies()

  if (isAccountMemberAuthenticated(cookieStore)) {
    redirect("/account")
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <Link href="/" className="flex justify-center">
          <h1 className="text-2xl font-bold text-blue-600">Shopper Store</h1>
        </Link>
        <h2 className="mt-10 text-center text-2xl font-medium leading-9 tracking-tight text-gray-900">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <ForgotPasswordForm />

        <p className="mt-10 text-center text-sm text-gray-500">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-semibold leading-6 text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
