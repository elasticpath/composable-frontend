import { afterEach, describe, expect, test, vi } from "vitest"
import { NextRequest } from "next/server"
import { middleware } from "./middleware"

function visit(path: string) {
  return middleware(new NextRequest(`http://localhost:3000${path}`))
}

function redirectTarget(response: Response) {
  const location = response.headers.get("location")
  return location ? new URL(location).pathname : null
}

function stubStoreVariables(values: {
  endpoint: string
  clientId: string
  passwordProfileId: string
}) {
  vi.stubEnv("NEXT_PUBLIC_EPCC_ENDPOINT_URL", values.endpoint)
  vi.stubEnv("NEXT_PUBLIC_EPCC_CLIENT_ID", values.clientId)
  vi.stubEnv("NEXT_PUBLIC_PASSWORD_PROFILE_ID", values.passwordProfileId)
}

describe("middleware", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  test("lets /configuration through to the page, which asks for a sign-in itself", () => {
    stubStoreVariables({
      endpoint: "https://api.example.com",
      clientId: "client",
      passwordProfileId: "profile",
    })

    expect(redirectTarget(visit("/configuration"))).toBeNull()
  })

  test("sends /configuration to /configuration-error when store variables are missing", () => {
    stubStoreVariables({ endpoint: "", clientId: "", passwordProfileId: "" })

    expect(redirectTarget(visit("/configuration"))).toBe("/configuration-error")
  })

  test("lets /configuration-error through when store variables are missing, so it does not loop", () => {
    stubStoreVariables({ endpoint: "", clientId: "", passwordProfileId: "" })

    expect(redirectTarget(visit("/configuration-error"))).toBeNull()
  })
})
