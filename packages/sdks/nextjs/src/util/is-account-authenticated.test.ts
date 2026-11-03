// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { isAccountAuthenticated } from "./is-account-authenticated"

afterEach(() => {
  for (const entry of document.cookie.split("; ").filter(Boolean)) {
    document.cookie = `${entry.split("=")[0]}=; Max-Age=0; Path=/`
  }
})

describe("isAccountAuthenticated", () => {
  it("is true when the default account member cookie is set", async () => {
    document.cookie = "_store_ep_account_member_token=token; Path=/"

    expect(await isAccountAuthenticated()).toBe(true)
  })

  it("is false when no account member cookie is set", async () => {
    expect(await isAccountAuthenticated()).toBe(false)
  })

  it("reads the account member cookie named by a storefront's own prefix", async () => {
    document.cookie = "acme_ep_account_member_token=token; Path=/"

    expect(await isAccountAuthenticated("acme_ep_account_member_token")).toBe(
      true,
    )
    expect(await isAccountAuthenticated()).toBe(false)
  })
})
