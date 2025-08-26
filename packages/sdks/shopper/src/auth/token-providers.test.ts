import { describe, it, expect, vi, beforeEach } from "vitest"
import { asAny } from "../test/utils"

// Mock SDK modules before imports
vi.mock("../client/sdk.gen", () => ({
  client: {
    setConfig: vi.fn(),
    getConfig: vi.fn().mockReturnValue({
      baseUrl: "https://api.example.com",
      headers: {},
      fetch: vi.fn(),
    }),
  },
  createAnAccessToken: vi.fn(),
}))

vi.mock("@hey-api/client-fetch", () => ({
  createClient: vi.fn((config?: any) => ({
    ...config,
    getConfig: vi.fn().mockReturnValue(config || {}),
  })),
  createConfig: vi.fn((cfg?: any) => cfg ?? {}),
}))

import {
  makeImplicitTokenProviderWithFreshSdk,
  makeImplicitTokenProviderCachedBare,
} from "./token-providers"
import { createClient } from "@hey-api/client-fetch"
import { createAnAccessToken } from "../client/sdk.gen"

beforeEach(() => {
  vi.resetAllMocks()
})

describe("makeImplicitTokenProviderWithFreshSdk", () => {
  it("builds a fresh bare client and calls createAnAccessToken with client + body", async () => {
    // Arrange bare client and op
    const bare = { __tag: "bare" }
    asAny(createClient).mockReturnValue(bare)

    asAny(createAnAccessToken).mockResolvedValue({
      data: { access_token: "TOK", expires_in: 3600, token_type: "Bearer" },
      error: undefined,
    })

    const provider = makeImplicitTokenProviderWithFreshSdk({
      baseUrl: "https://api.example.com",
      clientId: "CID",
      fetch: vi.fn(), // pass-through fetch should be used to build the bare client
      headers: { "x-a": "b" },
    })

    // Act
    const res = await provider({})

    // Assert createClient invocation
    expect(createClient).toHaveBeenCalledWith({
      baseUrl: "https://api.example.com",
      fetch: expect.any(Function),
      headers: { "x-a": "b" },
    })

    // Assert createAnAccessToken called with that client + body
    expect(createAnAccessToken).toHaveBeenCalledWith({
      client: bare,
      body: { grant_type: "implicit", client_id: "CID" },
    })

    // Result mapping
    expect(res).toEqual({
      access_token: "TOK",
      expires_in: 3600,
      expires: undefined,
      token_type: "Bearer",
    })
  })

  it("throws when the operation returns an error", async () => {
    const bare = { __tag: "bare" }
    asAny(createClient).mockReturnValue(bare)
    asAny(createAnAccessToken).mockResolvedValue({
      data: undefined,
      error: { type: "unauthorized" },
    })

    const provider = makeImplicitTokenProviderWithFreshSdk({
      baseUrl: "https://api.example.com",
      clientId: "CID",
    })

    await expect(provider({})).rejects.toThrow(
      "makeImplicitTokenProviderWithFreshSdk: Failed to get access token",
    )
  })

  it("handles responses where data is present but no expires fields", async () => {
    const bare = { __tag: "bare" }
    asAny(createClient).mockReturnValue(bare)
    asAny(createAnAccessToken).mockResolvedValue({
      data: { access_token: "TOK2" },
      error: undefined,
    })

    const provider = makeImplicitTokenProviderWithFreshSdk({
      baseUrl: "https://api.example.com",
      clientId: "CID",
    })

    const res = await provider({})
    expect(res).toEqual({
      access_token: "TOK2",
      expires_in: undefined,
      expires: undefined,
      token_type: undefined,
    })
  })
})

describe("makeImplicitTokenProviderCachedBare", () => {
  it("reuses the same bare client across calls", async () => {
    const bare = { __tag: "bare" }
    asAny(createClient).mockReturnValue(bare)

    asAny(createAnAccessToken)
      .mockResolvedValueOnce({
        data: { access_token: "A", expires_in: 60 },
        error: undefined,
      })
      .mockResolvedValueOnce({
        data: { access_token: "B", expires_in: 60 },
        error: undefined,
      })

    const provider = makeImplicitTokenProviderCachedBare({
      baseUrl: "https://api.example.com",
      clientId: "CID",
      headers: { h: "v" },
    })

    const r1 = await provider({})
    const r2 = await provider({})

    // createClient called only once
    expect(createClient).toHaveBeenCalledTimes(1)

    // both calls used the same client instance
    expect(createAnAccessToken).toHaveBeenNthCalledWith(1, {
      client: bare,
      body: { grant_type: "implicit", client_id: "CID" },
    })
    expect(createAnAccessToken).toHaveBeenNthCalledWith(2, {
      client: bare,
      body: { grant_type: "implicit", client_id: "CID" },
    })

    expect(r1.access_token).toBe("A")
    expect(r2.access_token).toBe("B")
  })

  it("throws when the cached op returns an error", async () => {
    const bare = { __tag: "bare" }
    asAny(createClient).mockReturnValue(bare)
    asAny(createAnAccessToken).mockResolvedValue({
      data: undefined,
      error: { message: "boom" },
    })

    const provider = makeImplicitTokenProviderCachedBare({
      baseUrl: "https://api.example.com",
      clientId: "CID",
    })

    await expect(provider({})).rejects.toThrow(
      "makeImplicitTokenProviderCachedBare: Failed to get access token",
    )
  })
})
