import { NextFetchEvent, NextRequest, NextResponse } from "next/server"
import {
    createAnAccessToken,
    AccessTokenResponse, createACart,
    createAccountCartAssociation,
} from "@epcc-sdk/sdks-shopper"
import {
    ACCOUNT_MEMBER_TOKEN_COOKIE_KEY,
    CART_COOKIE_KEY,
    CREDENTIALS_COOKIE_KEY,
    EPCC_ENDPOINT_URL
} from "@/app/constants";
import {tokenExpired} from "@/utils/token-expired";

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
        console.error("Missing client ID")
        const res = new NextResponse(null, { status: 500 })
        res.headers.set("x-error-message", "Missing environment variable")
        return res
    }

    const possibleImplicitCookie = req.cookies.get(CREDENTIALS_COOKIE_KEY)
    const parsedToken =
        possibleImplicitCookie &&
        (JSON.parse(possibleImplicitCookie.value) as AccessTokenResponse)

    const possibleCartCookie = req.cookies.get(CART_COOKIE_KEY)?.value

    // If both cookies are present, we can skip the token creation
    if (parsedToken && possibleCartCookie) {
        // If the token is not expired, we can skip the token creation
        if (possibleCartCookie && parsedToken && parsedToken?.expires && !tokenExpired(parsedToken.expires)) {
            return NextResponse.next()
        }
    }

    const response = NextResponse.next()
    let resolvedToken = parsedToken

    if (!resolvedToken) {
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
        resolvedToken = authResponse.data

        response.cookies.set(
            CREDENTIALS_COOKIE_KEY,
            JSON.stringify({
                ...resolvedToken,
                client_id: clientId,
            }),
            {
                sameSite: "strict",
                expires: new Date(resolvedToken.expires! * 1000),
            },
        )
    }

    // If the cart cookie is not set, we can create a new cart
    if (!possibleCartCookie) {
        const credAuthResponse = await createAnAccessToken({
            baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL,
            body: {
                grant_type: "client_credentials",
                client_id: process.env.NEXT_PUBLIC_EPCC_CLIENT_ID!,
                client_secret: process.env.EPCC_CLIENT_SECRET!,
            },
        })

        if (credAuthResponse.error) {
            throw new Error("Failed to get client credentials token: " + JSON.stringify(credAuthResponse.error))
        }

        const createdCart = await createACart({
            baseUrl: EPCC_ENDPOINT_URL,
            headers: {
                Authorization: `Bearer ${credAuthResponse.data.access_token}`,
            },
            body: {
                data: {
                    name: "Cart",
                },
            },
        });

        /**
         * Check response did not fail
         */
        if (!createdCart.data) {
            const res = new NextResponse(null, {status: 500})
            res.headers.set("x-error-message", "Failed to create cart")
            return res
        }

        // Check if there is an account authenticated
        const accountToken = req.cookies.get(ACCOUNT_MEMBER_TOKEN_COOKIE_KEY)?.value;
        if (accountToken) {
            const parsedAccountData = JSON.parse(accountToken) as { selected: string };
            const accountId = parsedAccountData.selected;

            const associateResponse = await createAccountCartAssociation({
                baseUrl: EPCC_ENDPOINT_URL,
                headers: {
                    Authorization: `Bearer ${credAuthResponse.data.access_token}`,
                },
                path: {
                    cartID: createdCart.data.data.id!
                },
                body: {
                    data: [
                        {
                            type: "account",
                            id: accountId
                        }
                    ]
                }
            })

            if (associateResponse.error) {
                throw new Error("Failed to associate cart with account: " + JSON.stringify(associateResponse.error))
            }
        }

        response.cookies.set(
            CART_COOKIE_KEY,
            createdCart.data?.data?.id!,
            {
                sameSite: "strict",
                expires: new Date(
                    (createdCart.data?.data?.meta?.timestamps as any)?.expires_at
                ),
            }
        );
    }

    return response
}

