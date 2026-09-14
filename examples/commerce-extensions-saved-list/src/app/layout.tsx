import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"
import { getShopperSession } from "@/lib/account-session"
import { logout } from "./actions"

export const metadata: Metadata = {
  title: "Saved list on Commerce Extensions",
  description:
    "Account-scoped custom data stored on Elastic Path Commerce Extensions",
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getShopperSession()

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
            <Link href="/" className="font-medium">
              Saved list example
            </Link>
            <div className="flex items-center gap-4 text-sm">
              {session ? (
                <>
                  <Link href="/saved-list" className="text-blue-600">
                    Saved list
                  </Link>
                  <span className="text-gray-500">
                    {session.accountName || session.email}
                  </span>
                  <form action={logout}>
                    <button type="submit" className="text-gray-600 underline">
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="text-blue-600">
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
