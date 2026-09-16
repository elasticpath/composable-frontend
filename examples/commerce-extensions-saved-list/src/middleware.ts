import { NextRequest, NextResponse } from "next/server"
import {
  createAnAccessToken,
  type AccessTokenResponse,
} from "@epcc-sdk/sdks-shopper"
import { CREDENTIALS_COOKIE_KEY } from "./app/constants"
import { unusableEnvRequirements } from "./lib/store-requirements"

const clientId = process.env.NEXT_PUBLIC_EPCC_CLIENT_ID

export const config = {
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}

function tokenExpired(expires: number): boolean {
  return Math.floor(Date.now() / 1000) >= expires
}

/**
 * Keeps a valid implicit token in a cookie for catalog reads.
 *
 * It deliberately does not guard `/saved-list`. Middleware sees only cookies,
 * and a guard there would be a second, weaker copy of the check the route
 * handlers already do against the signed session. The page redirects instead.
 */
export async function middleware(req: NextRequest) {
  // The page that explains the misconfiguration must render without one.
  if (req.nextUrl.pathname.startsWith("/configuration-error")) {
    return NextResponse.next()
  }

  // Middleware runs before any page, so an endpoint it cannot build a URL from
  // fails here first, on every route, as an unexplained 500. Check it here and
  // send the reader somewhere that says so.
  if (
    typeof clientId !== "string" ||
    unusableEnvRequirements(process.env).length > 0
  ) {
    return NextResponse.redirect(new URL("/configuration-error", req.url))
  }

  const existing = req.cookies.get(CREDENTIALS_COOKIE_KEY)

  let parsed: AccessTokenResponse | undefined
  if (existing) {
    try {
      parsed = JSON.parse(existing.value) as AccessTokenResponse
    } catch {
      parsed = undefined
    }
  }

  if (parsed?.expires && !tokenExpired(parsed.expires)) {
    return NextResponse.next()
  }

  const authResponse = await createAnAccessToken({
    baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
    body: { grant_type: "implicit", client_id: clientId },
  })

  if (!authResponse.data?.expires) {
    return NextResponse.redirect(new URL("/configuration-error", req.url))
  }

  const response = NextResponse.next()
  response.cookies.set(
    CREDENTIALS_COOKIE_KEY,
    JSON.stringify(authResponse.data),
    {
      sameSite: "strict",
      expires: new Date(authResponse.data.expires * 1000),
    },
  )

  return response
}
