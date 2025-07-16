"use client"

import { logout } from "../actions"

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="bg-gray-100 text-gray-900 hover:bg-gray-200 px-4 py-2 rounded font-medium transition-colors"
      >
        Sign out
      </button>
    </form>
  )
}
