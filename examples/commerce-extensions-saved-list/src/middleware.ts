import { NextRequest, NextResponse } from "next/server"
import {
  createAnAccessToken,
  type AccessTokenResponse,
} from "@epcc-sdk/sdks-shopper"
import { CREDENTIALS_COOKIE_KEY } from "./app/constants"
import { endpointProblem } from "./lib/store-requirements"

const clientId = process.env.NEXT_PUBLIC_EPCC_CLIENT_ID
const endpointUrl = process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL

export const config = {
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}

function tokenExpired(expires: number): boolean {
  return Math.floor(Date.now() / 1000) >= expires
}

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/configuration-error")) {
    return NextResponse.next()
  }

  if (typeof clientId !== "string" || endpointProblem(endpointUrl)) {
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
    baseUrl: endpointUrl,
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
      httpOnly: true,
      sameSite: "strict",
      expires: new Date(authResponse.data.expires * 1000),
    },
  )

  return response
}
