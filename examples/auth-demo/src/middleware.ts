import { NextRequest, NextResponse } from "next/server"
import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "./lib/constants"

// Define paths that require authentication
const protectedPaths = ["/dashboard"]

// Define paths that are only for non-authenticated users
const authOnlyPaths = ["/auth/login", "/auth/register"]

export function middleware(request: NextRequest) {
  const token = request.cookies.get(ACCOUNT_MEMBER_TOKEN_COOKIE_NAME)
  const isAuthenticated = token !== undefined
  const path = request.nextUrl.pathname

  // Redirect authenticated users away from auth pages
  if (
    isAuthenticated &&
    authOnlyPaths.some((authPath) => path.startsWith(authPath))
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect unauthenticated users away from protected pages
  if (
    !isAuthenticated &&
    protectedPaths.some((protectedPath) => path.startsWith(protectedPath))
  ) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [...protectedPaths, ...authOnlyPaths],
}
