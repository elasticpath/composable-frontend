import { NextFetchEvent, NextRequest, NextResponse } from "next/server"
import {
  createAnAccessToken,
  type AccessTokenResponse,
} from "@epcc-sdk/sdks-shopper"
import { CREDENTIALS_COOKIE_KEY } from "./app/constants"

const clientId = process.env.NEXT_PUBLIC_EPCC_CLIENT_ID

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}

export async function middleware(req: NextRequest, event: NextFetchEvent) {
  if (typeof clientId !== "string") {
    console.log("Missing client ID")
    const res = new NextResponse(null, { status: 500 })
    res.headers.set("x-error-message", "Missing environment variable")
    return res
  }

  const possibleImplicitCookie = req.cookies.get(CREDENTIALS_COOKIE_KEY)

  const parsedToken =
    possibleImplicitCookie &&
    (JSON.parse(possibleImplicitCookie.value) as AccessTokenResponse)

  if (parsedToken?.expires && !tokenExpired(parsedToken.expires)) {
    return NextResponse.next()
  }

  const authResponse = await createAnAccessToken({
    baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
    body: {
      grant_type: "implicit",
      client_id: clientId,
    },
  })

  /**
   * Check response did not fail
   */
  if (!authResponse.data) {
    const res = new NextResponse(null, { status: 500 })
    res.headers.set("x-error-message", "Failed to get access token")
    return res
  }

  const token = authResponse.data

  const response = NextResponse.next()

  response.cookies.set(
    CREDENTIALS_COOKIE_KEY,
    JSON.stringify({
      ...token,
      client_id: clientId,
    }),
    {
      sameSite: "strict",
      expires: new Date(token.expires! * 1000),
    },
  )

  return response
}

function tokenExpired(expires: number): boolean {
  return Math.floor(Date.now() / 1000) >= expires
}
