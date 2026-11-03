
import { client } from "@epcc-sdk/sdks-shopper";
import {ACCOUNT_MEMBER_TOKEN_COOKIE_KEY, CREDENTIALS_COOKIE_KEY} from "@/app/constants";
import {getCookieValue} from "@/utils/get-cookie-value";
import {getAccountCookie, parseAccountMemberCredentialsCookieStr} from "@/utils/account-cookie-helper";

// This is cross-environment and will work for both client and server side code
// Uses lazy loading to ensure the correct cookie reading method is used based on the environment
export function initializeShopperClient() {
    client.setConfig({
        baseUrl: process.env.NEXT_PUBLIC_EPCC_ENDPOINT_URL!,
    })

    /**
     * This interceptor reads the authentication cookie set by the middleware
     * and adds the Authorization header to the request.
     *
     * and alternative would be to use the next.js helper applyDefaultNextMiddleware(client) which comes with this interceptor by default.
     * import {applyDefaultNextMiddleware} from "@epcc-sdk/sdks-nextjs"
     * applyDefaultNextMiddleware(client)
     */
    client.interceptors.request.use(async (request) => {
        let cookieValue: string | undefined

        if (typeof window === "undefined") {
            // Dynamically import next/headers on the server.
            const headersModule = await import("next/headers")
            cookieValue = (await headersModule.cookies()).get(CREDENTIALS_COOKIE_KEY)?.value
        } else {
            // Client side: read document.cookie.
            cookieValue = getCookieValue(CREDENTIALS_COOKIE_KEY)
        }

        if (request.headers.get("Authorization")) {
            return request
        }

        let bearerToken: string | null = null
        if (cookieValue) {
            try {
                const parsed = JSON.parse(cookieValue)
                if (parsed?.access_token) {
                    bearerToken = `Bearer ${parsed.access_token}`
                }
            } catch (err) {
                console.error(
                    "Elastic Path Next.js authentication cookie interceptor: Failed to parse auth cookie",
                    err,
                )
            }
        }

        if (bearerToken) {
            request.headers.set("Authorization", bearerToken)
        } else {
            console.warn(
                "Elastic Path Next.js authentication cookie interceptor: Did not set Authorization header on request, no access token found in cookie, please check the cookie name.",
            )
        }

        return request
    })

    /**
     *
     */
    client.interceptors.request.use(async (request) => {
        const cookieValue = await getAccountCookie(ACCOUNT_MEMBER_TOKEN_COOKIE_KEY)

        // Next.js cookieStore.delete replaces a cookie with an empty string so we need to check for that here.
        if (!cookieValue) {
            return request
        }

        const credentials = parseAccountMemberCredentialsCookieStr(cookieValue)

        if (!credentials) {
            console.warn(
                "Invalid account member credentials cookie; skipping token setting.",
            )
            return request
        }

        const token = credentials.accounts[credentials.selected]?.token

        if (token) {
            request.headers.set("EP-Account-Management-Authentication-Token", token)
        }
        return request
    })
}


