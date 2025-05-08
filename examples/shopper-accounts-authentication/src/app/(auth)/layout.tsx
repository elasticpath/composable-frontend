import { ReactNode } from "react"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className="bg-gray-50 min-h-screen">{children}</div>
}
