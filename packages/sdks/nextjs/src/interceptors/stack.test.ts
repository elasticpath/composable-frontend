// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import {
  createClient,
  createConfig,
  getByContextAllProducts,
} from "@epcc-sdk/sdks-shopper"
import { applyDefaultNextMiddleware } from "./stack"

const baseUrl = "https://useast.api.elasticpath.com"

function setCookie(name: string, value: unknown) {
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; Path=/`
}

function stubFetch() {
  const requests: Request[] = []
  const transport = (async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push(
      input instanceof Request && init === undefined
        ? input
        : new Request(input, init),
    )
    return new Response(JSON.stringify({ data: [] }), {
      headers: { "Content-Type": "application/json" },
    })
  }) as typeof fetch
  return { requests, transport }
}

afterEach(() => {
  for (const entry of document.cookie.split("; ").filter(Boolean)) {
    document.cookie = `${entry.split("=")[0]}=; Max-Age=0; Path=/`
  }
})

describe("applyDefaultNextMiddleware", () => {
  it("adds the cookie's bearer token and account token to a shopper client's requests", async () => {
    setCookie("_store_ep_credentials", { access_token: "from-cookie" })
    setCookie("_store_ep_account_member_token", {
      accounts: {
        "account-1": {
          account_id: "account-1",
          account_name: "Account",
          expires: "2099-01-01T00:00:00Z",
          token: "account-token",
          type: "account_management_authentication_token",
        },
      },
      selected: "account-1",
      accountMemberId: "member-1",
    })
    const { requests, transport } = stubFetch()
    const client = createClient(createConfig({ baseUrl, fetch: transport }))

    applyDefaultNextMiddleware(client)
    await getByContextAllProducts({ client })

    expect(requests[0]!.url).toBe(`${baseUrl}/catalog/products`)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer from-cookie")
    expect(
      requests[0]!.headers.get("EP-Account-Management-Authentication-Token"),
    ).toBe("account-token")
  })
})
