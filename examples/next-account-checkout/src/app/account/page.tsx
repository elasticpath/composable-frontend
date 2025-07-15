import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { retrieveAccountMemberCredentials } from "../../lib/auth"
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "../constants"
import { LogoutButton } from "./LogoutButton"

export default async function Account() {
  const cookieStore = await cookies()
  const credentials = retrieveAccountMemberCredentials(cookieStore)

  if (!credentials) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans">
      <main className="max-w-3xl mx-auto bg-white p-6 rounded shadow-sm">
        <div className="mb-6 border-b border-gray-300 pb-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-medium mb-2 text-black">
              Account Dashboard
            </h1>
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              Back to Store
            </Link>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-medium mb-3 text-black">
            Your Information
          </h2>
          <div className="bg-gray-100 p-4 rounded border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Name</p>
                <p className="font-medium text-black">{credentials.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Email</p>
                <p className="font-medium text-black">{credentials.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-300 pt-4">
          <LogoutButton />
        </div>
      </main>
    </div>
  )
}
