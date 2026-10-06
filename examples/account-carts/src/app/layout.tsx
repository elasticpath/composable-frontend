import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"
import {
  IdentityUnavailableError,
  getShopperSession,
  type AccountSession,
} from "@/lib/account-session"
import { logout } from "./actions"

export const metadata: Metadata = {
  title: "Account carts",
  description: "Carts that belong to an Elastic Path account",
}

async function headerSession(): Promise<AccountSession | null | "unknown"> {
  try {
    return await getShopperSession()
  } catch (error) {
    if (error instanceof IdentityUnavailableError) return "unknown"
    throw error
  }
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await headerSession()

  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <header className="border-b border-gray-200 bg-white">
          <nav className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4">
            <Link href="/" className="font-medium">
              Account carts example
            </Link>
            <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {session === "unknown" ? null : session ? (
                <>
                  <Link href="/" className="text-blue-600">
                    Products
                  </Link>
                  <Link href="/cart" className="text-blue-600">
                    Cart
                  </Link>
                  <Link href="/saved-carts" className="text-blue-600">
                    Saved carts
                  </Link>
                  <Link href="/configuration" className="text-blue-600">
                    Configuration
                  </Link>
                  <span className="min-w-0 wrap-anywhere text-gray-500">
                    {session.accountName}
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
        <main className="mx-auto max-w-4xl wrap-anywhere px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
