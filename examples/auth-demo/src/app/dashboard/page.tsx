import { cookies } from "next/headers"
import { LogoutButton } from "@/components/LogoutButton"
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "@/lib/constants"
import { retrieveAccountMemberCredentials } from "@/lib/retrieve-account-member-credentials"

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const credentials = retrieveAccountMemberCredentials(
    cookieStore,
    ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <LogoutButton />
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium leading-6 text-gray-900">
                Account Information
              </h2>
              <div className="mt-5 border-t border-gray-200">
                <dl className="divide-y divide-gray-200">
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                    <dt className="text-sm font-medium text-gray-500">
                      Authentication Status
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                        Authenticated
                      </span>
                    </dd>
                  </div>
                  <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                    <dt className="text-sm font-medium text-gray-500">
                      Token Expires
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                      {credentials?.expires
                        ? new Date(credentials.expires).toLocaleString()
                        : "Unknown"}
                    </dd>
                  </div>
                  {credentials?.selected && (
                    <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5">
                      <dt className="text-sm font-medium text-gray-500">
                        Selected Account
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        {credentials.selected}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <p className="text-sm text-gray-500">
                You are now authenticated with Elastic Path. This page
                demonstrates how to access user data after authentication.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
