import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Elastic Path Auth Demo",
  description: "A demo showing authentication with Elastic Path",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
