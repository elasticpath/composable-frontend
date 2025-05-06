import { LoginForm } from "./LoginForm"
import { isAccountMemberAuthenticated } from "@/lib/is-account-member-authenticated"
import { redirect } from "next/navigation"

interface LoginPageProps {
  searchParams: {
    returnUrl?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  // If user is already authenticated, redirect to dashboard
  if (isAccountMemberAuthenticated()) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to your account
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your credentials to access your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <LoginForm returnUrl={searchParams.returnUrl} />
        </div>
      </div>
    </div>
  )
}
