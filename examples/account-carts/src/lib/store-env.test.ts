import { afterEach, describe, expect, test, vi } from "vitest"
import { storeEnv } from "./store-env"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("storeEnv", () => {
  test("carries the three variables the shopper pages need and nothing else", () => {
    vi.stubEnv("NEXT_PUBLIC_EPCC_ENDPOINT_URL", "https://api.example.test")
    vi.stubEnv("NEXT_PUBLIC_EPCC_CLIENT_ID", "client")
    vi.stubEnv("NEXT_PUBLIC_PASSWORD_PROFILE_ID", "profile")
    vi.stubEnv("EPCC_CLIENT_SECRET", "secret")
    vi.stubEnv("UNRELATED_SETTING", "value")

    expect(storeEnv()).toEqual({
      NEXT_PUBLIC_EPCC_ENDPOINT_URL: "https://api.example.test",
      NEXT_PUBLIC_EPCC_CLIENT_ID: "client",
      NEXT_PUBLIC_PASSWORD_PROFILE_ID: "profile",
    })
  })
})
