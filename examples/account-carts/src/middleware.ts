import { NextRequest, NextResponse } from "next/server"
import { envRequirementProblems } from "./lib/store-requirements"

export const config = {
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/configuration")) {
    return NextResponse.next()
  }

  const problems = envRequirementProblems({
    NEXT_PUBLIC_EPCC_ENDPOINT_URL: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
    NEXT_PUBLIC_EPCC_CLIENT_ID: process.env.NEXT_PUBLIC_EPCC_CLIENT_ID,
    NEXT_PUBLIC_PASSWORD_PROFILE_ID:
      process.env.NEXT_PUBLIC_PASSWORD_PROFILE_ID,
  })

  if (problems.length > 0) {
    return NextResponse.redirect(new URL("/configuration-error", req.url))
  }

  return NextResponse.next()
}
