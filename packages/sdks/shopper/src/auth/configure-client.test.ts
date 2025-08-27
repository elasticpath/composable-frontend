import { describe, it, expect, vi, beforeEach } from "vitest"
import { makeJwtExpIn } from "../test/utils"

// Mock SDK modules before imports
vi.mock("../client/sdk.gen", () => ({
  client: {
    setConfig: vi.fn(),
    getConfig: vi.fn(() => ({
      baseUrl: "https://api.example.com",
      headers: {},
      fetch: vi.fn(),
    })),
  },
  createAnAccessToken: vi.fn(),
}))

vi.mock("@hey-api/client-fetch", () => ({
  createClient: vi.fn(),
  createConfig: vi.fn((cfg?: any) => cfg ?? {}),
}))

import { configureClient, createShopperClient } from "./configure-client"
import { client as singleton, createAnAccessToken } from "../client/sdk.gen"
import { createClient as sdkCreateClient } from "@hey-api/client-fetch"

beforeEach(() => {
  vi.clearAllMocks()
  // Clear any stored tokens
  localStorage.clear()
  // Ensure createClient has the default implementation
  ;(sdkCreateClient as any).mockImplementation((config?: any) => ({
    ...config,
    getConfig: () => config,
  }))
})

describe("configureClient (singleton)", () => {
  it("installs auth-wrapped fetch (adds Authorization) and normalizes headers", async () => {
    const baseFetch = vi
      .fn()
      .mockResolvedValue(new Response("ok", { status: 200 }))

    // the fresh bare client (from token provider) can be any object
    ;(sdkCreateClient as any).mockReturnValueOnce({ __tag: "bare" })
    ;(createAnAccessToken as any).mockResolvedValueOnce({
      data: { access_token: makeJwtExpIn(60) },
      error: undefined,
    })

    configureClient(
      {
        baseUrl: "https://api.example.com",
        headers: { "x-one": 1 as unknown as string }, // non-string -> should normalize to "1"
        fetch: baseFetch,
      },
      {
        clientId: "CID",
      },
    )

    expect(singleton.setConfig).toHaveBeenCalledTimes(1)
    const cfg = (singleton.setConfig as any).mock.calls[0][0]
    expect(cfg.baseUrl).toBe("https://api.example.com")
    expect(cfg.headers).toEqual({ "x-one": "1" }) // normalized
    expect(typeof cfg.fetch).toBe("function")

    // invoke installed fetch; baseFetch receives a Request
    await cfg.fetch(new Request("https://api.example.com/resource"))
    expect(baseFetch).toHaveBeenCalledTimes(1)
    const req = (baseFetch as any).mock.calls[0][0] as Request
    expect(req instanceof Request).toBe(true)
    expect(req.headers.get("authorization")).toMatch(/^Bearer /)
  })

  it("wrapUserFetch=false returns a standard-shaped fetch that leaves Authorization untouched", async () => {
    const baseFetch = vi
      .fn()
      .mockResolvedValue(new Response("ok", { status: 200 }))

    ;(sdkCreateClient as any).mockReturnValueOnce({ __tag: "bare" })
    ;(createAnAccessToken as any).mockResolvedValueOnce({
      data: { access_token: makeJwtExpIn(60) },
      error: undefined,
    })

    configureClient(
      {
        baseUrl: "https://api.example.com",
        fetch: baseFetch,
      },
      {
        clientId: "CID",
        wrapUserFetch: false,
      },
    )

    const cfg = (singleton.setConfig as any).mock.calls[0][0]
    await cfg.fetch(new Request("https://api.example.com/resource", { headers: { x: "y" } }))

    // baseFetch is called with a Request
    const req = (baseFetch as any).mock.calls[0][0] as Request
    expect(req.headers.get("authorization")).toBeNull()
    expect(req.headers.get("x")).toBe("y")
  })
})

describe("createShopperClient (factory)", () => {
  it("returns a new instance configured with authed fetch", async () => {
    const baseFetch = vi
      .fn()
      .mockResolvedValue(new Response("ok", { status: 200 }))

    // Track calls to createClient
    const createClientCalls: any[] = []
    ;(sdkCreateClient as any).mockImplementation((cfg: any) => {
      createClientCalls.push(cfg)
      // First call is from token provider, second is main client
      if (createClientCalls.length === 1) {
        return { __tag: "bare" }
      }
      return { __clientTag: "mocked" }
    })
    
    ;(createAnAccessToken as any).mockImplementation(() => {
      // Return the structure that the token provider expects
      return Promise.resolve({
        data: { 
          access_token: makeJwtExpIn(60),
          expires_in: 3600,
          token_type: "Bearer"
        },
        error: undefined,
      })
    })

    createShopperClient(
      {
        baseUrl: "https://api.example.com",
        fetch: baseFetch,
        headers: { "x-two": "2" },
      },
      {
        clientId: "CID",
      },
    )

    // The second call to createClient should have the auth-wrapped fetch
    expect(createClientCalls.length).toBeGreaterThanOrEqual(1)
    const mainClientConfig = createClientCalls[createClientCalls.length - 1]
    expect(mainClientConfig.baseUrl).toBe("https://api.example.com")
    expect(typeof mainClientConfig.fetch).toBe("function")

    // Test the auth-wrapped fetch - this should trigger token fetching
    await mainClientConfig.fetch(new Request("https://api.example.com/something"))
    
    // Auth should have been applied
    expect(baseFetch).toHaveBeenCalled()
    const req = (baseFetch as any).mock.calls[0][0] as Request
    expect(req instanceof Request).toBe(true)
    expect(req.headers.get("authorization")).toMatch(/^Bearer /)
    
    // Test that user headers are preserved
    await mainClientConfig.fetch(new Request("https://api.example.com/with-headers", { headers: { "x-two": "2" } }))
    const req2 = (baseFetch as any).mock.calls[1][0] as Request
    expect(req2.headers.get("x-two")).toBe("2")
    expect(req2.headers.get("authorization")).toMatch(/^Bearer /)
  })
})
