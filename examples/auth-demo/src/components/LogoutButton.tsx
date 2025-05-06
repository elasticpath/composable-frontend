"use client"

import { logout } from "@/app/auth/actions"
import { Button } from "./Button"

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({ className }: LogoutButtonProps) {
  return (
    <form action={logout}>
      <Button type="submit" variant="secondary" className={className}>
        Sign out
      </Button>
    </form>
  )
}
