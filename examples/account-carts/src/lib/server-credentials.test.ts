import { afterEach, beforeEach, describe, expect, test, vi } from "vitest"

const { createAnAccessToken } = vi.hoisted(() => ({
  createAnAccessToken: vi.fn(),
}))

vi.mock("@epcc-sdk/sdks-shopper", () => ({ createAnAccessToken }))

const tokenResponse = (token: string, expires: number) => ({
  data: { access_token: token, expires },
  error: undefined,
})

const inAnHour = () => Math.floor(Date.now() / 1000) + 3600

async function load() {
  vi.resetModules()
  return import("./server-credentials")
}

beforeEach(() => {
  createAnAccessToken.mockReset()
  vi.stubEnv("NEXT_PUBLIC_EPCC_ENDPOINT_URL", "https://api.example.test")
  vi.stubEnv("NEXT_PUBLIC_EPCC_CLIENT_ID", "public-client-id")
  vi.stubEnv("EPCC_CLIENT_ID", "server-client-id")
  vi.stubEnv("EPCC_CLIENT_SECRET", "server-client-secret")
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("getServerAccessToken", () => {
  test("asks for a client_credentials token with the server key", async () => {
    createAnAccessToken.mockResolvedValue(
      tokenResponse("server-token", inAnHour()),
    )
    const { getServerAccessToken } = await load()

    expect(await getServerAccessToken()).toBe("server-token")
    expect(createAnAccessToken).toHaveBeenCalledWith({
      baseUrl: "https://api.example.test",
      body: {
        grant_type: "client_credentials",
        client_id: "server-client-id",
        client_secret: "server-client-secret",
      },
    })
  })

  test("reuses the token until it is about to expire", async () => {
    createAnAccessToken.mockResolvedValue(
      tokenResponse("server-token", inAnHour()),
    )
    const { getServerAccessToken } = await load()

    await getServerAccessToken()
    await getServerAccessToken()

    expect(createAnAccessToken).toHaveBeenCalledTimes(1)
  })

  test("asks again when the token is about to expire", async () => {
    createAnAccessToken
      .mockResolvedValueOnce(
        tokenResponse("old", Math.floor(Date.now() / 1000) + 30),
      )
      .mockResolvedValueOnce(tokenResponse("new", inAnHour()))
    const { getServerAccessToken } = await load()

    await getServerAccessToken()

    expect(await getServerAccessToken()).toBe("new")
  })

  test("says which variables are missing instead of calling Elastic Path", async () => {
    vi.stubEnv("EPCC_CLIENT_SECRET", "")
    const { getServerAccessToken } = await load()

    await expect(getServerAccessToken()).rejects.toThrow(
      "EPCC_CLIENT_ID and EPCC_CLIENT_SECRET must be set",
    )
    expect(createAnAccessToken).not.toHaveBeenCalled()
  })

  test("fails when Elastic Path refuses the key", async () => {
    createAnAccessToken.mockResolvedValue({
      data: undefined,
      error: { errors: [{ status: 401 }] },
    })
    const { getServerAccessToken } = await load()

    await expect(getServerAccessToken()).rejects.toThrow(
      "Failed to get a server token",
    )
  })

  test("never lets the implicit token stand in for the server token", async () => {
    createAnAccessToken
      .mockResolvedValueOnce(tokenResponse("implicit-token", inAnHour()))
      .mockResolvedValueOnce(tokenResponse("server-token", inAnHour()))
    const { getImplicitAccessToken, getServerAccessToken } = await load()

    await getImplicitAccessToken()

    expect(await getServerAccessToken()).toBe("server-token")
  })
})

describe("getImplicitAccessToken", () => {
  test("asks for an implicit token with the public client id and no secret", async () => {
    createAnAccessToken.mockResolvedValue(
      tokenResponse("implicit-token", inAnHour()),
    )
    const { getImplicitAccessToken } = await load()

    expect(await getImplicitAccessToken()).toBe("implicit-token")
    expect(createAnAccessToken).toHaveBeenCalledWith({
      baseUrl: "https://api.example.test",
      body: { grant_type: "implicit", client_id: "public-client-id" },
    })
  })
})
