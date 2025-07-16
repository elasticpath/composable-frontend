import type { Metadata } from "next"
import "./globals.css"
import { CartProvider } from "../components/cart-provider"

export const metadata: Metadata = {
  title: "Account Checkout Demo - Elastic Path",
  description:
    "Next.js account checkout example with Elastic Path Commerce Cloud",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-gray-50">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  )
}
