import { ACCOUNT_MEMBER_TOKEN_COOKIE_NAME } from "./constants"
import { ResponseError } from "@epcc-sdk/sdks-shopper"

export function createCookieFromTokenResponse(tokenData: any) {
  if (!tokenData) {
    throw new Error("No token data provided")
  }

  // Extract token and expiry information
  const tokenInfo = tokenData.meta?.tokens?.access_token

  if (!tokenInfo) {
    throw new ResponseError("Invalid token response", {
      status: 400,
      statusText: "Bad Request",
    })
  }

  // Calculate expiry time (tokenInfo.expires_in is in seconds)
  const expiresDate = new Date()
  expiresDate.setSeconds(expiresDate.getSeconds() + tokenInfo.expires_in)

  // Create the cookie with token information
  return {
    name: ACCOUNT_MEMBER_TOKEN_COOKIE_NAME,
    value: JSON.stringify({
      token: tokenInfo.token,
      expires: expiresDate.toISOString(),
      type: "account_member",
      accounts: tokenData.data?.relationships?.account_members?.data.reduce(
        (acc: Record<string, any>, member: any) => {
          if (member.id && member.type === "account_member") {
            const accountId = member.relationships?.account?.data?.id
            if (accountId) {
              acc[accountId] = {
                account_id: accountId,
                account_member_id: member.id,
                expires: expiresDate.toISOString(),
              }
            }
          }
          return acc
        },
        {},
      ),
      selected:
        tokenData.data?.relationships?.account_members?.data[0]?.relationships
          ?.account?.data?.id,
    }),
    path: "/",
    sameSite: "strict",
    expires: expiresDate,
  }
}
