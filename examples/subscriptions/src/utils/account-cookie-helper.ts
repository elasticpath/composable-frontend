import {getCookieValue} from "@/utils/get-cookie-value";
import {ACCOUNT_MEMBER_TOKEN_COOKIE_KEY} from "@/app/constants";

export async function getAccountCookie(
    key: string = ACCOUNT_MEMBER_TOKEN_COOKIE_KEY,
) {
    let cookieValue: string | undefined

    if (typeof window === "undefined") {
        // Dynamically import next/headers on the server.
        const headersModule = await import("next/headers")
        cookieValue = (await headersModule.cookies()).get(key)?.value
    } else {
        // Client side: read document.cookie.
        cookieValue = getCookieValue(key)
    }

    return cookieValue
}


export interface AccountMemberCredential {
    account_id: string
    account_name: string
    expires: string
    token: string
    type: "account_management_authentication_token"
}

export interface AccountMemberCredentials {
    accounts: Record<string, AccountMemberCredential>
    selected: string
    accountMemberId: string
}

// Validate a single credential
function isAccountMemberCredential(val: any): val is AccountMemberCredential {
    return (
        typeof val === "object" &&
        val !== null &&
        typeof val.account_id === "string" &&
        typeof val.account_name === "string" &&
        typeof val.expires === "string" &&
        typeof val.token === "string" &&
        val.type === "account_management_authentication_token"
    )
}

// Validate the overall credentials object
function isAccountMemberCredentials(val: any): val is AccountMemberCredentials {
    if (typeof val !== "object" || val === null) return false
    if (typeof val.selected !== "string") return false
    if (typeof val.accountMemberId !== "string") return false
    if (typeof val.accounts !== "object" || val.accounts === null) return false

    // Check every key in the accounts record
    for (const key in val.accounts) {
        if (!isAccountMemberCredential(val.accounts[key])) {
            return false
        }
    }
    return true
}

// Main function that parses and validates the cookie string
export function parseAccountMemberCredentialsCookieStr(
    str: string,
): AccountMemberCredentials | undefined {
    try {
        const parsed = JSON.parse(str)
        if (!isAccountMemberCredentials(parsed)) {
            console.error(
                "Invalid account member credentials cookie structure:",
                parsed,
            )
            return undefined
        }
        return parsed
    } catch (error) {
        console.error("Failed to parse JSON:", error)
        return undefined
    }
}
