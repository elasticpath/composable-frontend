import { afterEach, describe, expect, test, vi } from "vitest"
import { serverKeyEnv } from "./server-key-env"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("serverKeyEnv", () => {
  test("carries the server key's id and secret and nothing else", () => {
    vi.stubEnv("EPCC_CLIENT_ID", "id")
    vi.stubEnv("EPCC_CLIENT_SECRET", "secret")
    vi.stubEnv("NEXT_PUBLIC_EPCC_CLIENT_ID", "public-id")
    vi.stubEnv("UNRELATED_SETTING", "value")

    expect(serverKeyEnv()).toEqual({
      EPCC_CLIENT_ID: "id",
      EPCC_CLIENT_SECRET: "secret",
    })
  })
})
