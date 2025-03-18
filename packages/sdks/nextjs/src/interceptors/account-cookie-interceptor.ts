import { RequestMiddleware } from "./stack"
import { getAccountCookie } from "../util/get-account-cookie"

export function createAccountCookieInterceptor(creatOptions?: {
  cookieKey?: string
}): RequestMiddleware {
  return async function accountCookieInterceptor(request, options) {
    const cookieValue = await getAccountCookie(creatOptions?.cookieKey)

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
  }
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
