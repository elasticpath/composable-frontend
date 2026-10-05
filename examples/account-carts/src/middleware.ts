import { NextRequest, NextResponse } from "next/server"
import { storeEnv } from "./lib/store-env"
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

  const problems = envRequirementProblems(storeEnv())

  if (problems.length > 0) {
    return NextResponse.redirect(new URL("/configuration-error", req.url))
  }

  return NextResponse.next()
}
