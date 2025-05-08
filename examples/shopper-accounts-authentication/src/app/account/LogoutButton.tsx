"use client"

import { logout } from "../actions"
import { Button } from "../../components/ui"

export function LogoutButton() {
  return (
    <form action={logout}>
      <Button type="submit" variant="secondary">
        Sign out
      </Button>
    </form>
  )
}
