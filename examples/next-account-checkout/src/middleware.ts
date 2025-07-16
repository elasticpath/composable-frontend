import { NextFetchEvent, NextRequest, NextResponse } from "next/server"
import {
  createAnAccessToken,
  AccessTokenResponse,
} from "@epcc-sdk/sdks-shopper"
import {
  CREDENTIALS_COOKIE_KEY,
  ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
} from "./app/constants"
import { tokenExpired } from "./lib/auth"

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

  // Check if we need to handle implicit authentication for the store
  const possibleImplicitCookie = req.cookies.get(CREDENTIALS_COOKIE_KEY)
  const parsedToken =
    possibleImplicitCookie &&
    (JSON.parse(possibleImplicitCookie.value) as AccessTokenResponse)

  // If the token doesn't exist or is expired, get a new one
  if (!parsedToken?.expires || tokenExpired(parsedToken.expires)) {
    const authResponse = await createAnAccessToken({
      baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
      body: {
        grant_type: "implicit",
        client_id: clientId,
      },
    })

    // Check response did not fail
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

  // Check for protected routes that require account authentication
  if (req.nextUrl.pathname.startsWith("/account")) {
    const accountMemberCookie = req.cookies.get(
      ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
    )

    if (!accountMemberCookie) {
      const url = new URL("/login", req.url)
      url.searchParams.set("returnUrl", req.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    try {
      const parsedCookie = JSON.parse(accountMemberCookie.value)
      if (tokenExpired(parsedCookie.expires)) {
        // Token is expired, redirect to login
        const url = new URL("/login", req.url)
        url.searchParams.set("returnUrl", req.nextUrl.pathname)
        return NextResponse.redirect(url)
      }
    } catch (e) {
      // Invalid cookie format, redirect to login
      const url = new URL("/login", req.url)
      url.searchParams.set("returnUrl", req.nextUrl.pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}
