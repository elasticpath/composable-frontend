import { describe, expect, it, vi } from "vitest"
import { createConfiguredClient } from "./configured-client"
import type { ConfigurableClientConfig } from "./configured-client"
import { createTokenSource } from "./token-source"
import type { StorageAdapter, TokenSource } from "./types"

interface FakeConfig extends ConfigurableClientConfig {
  headers?: Record<string, string>
  throwOnError?: boolean
}

/** Stands in for a generated package's `{ createClient, createConfig }` pair. */
function fakeFactories() {
  const seen: FakeConfig[] = []
  return {
    seen,
    factories: {
      createConfig: (override: FakeConfig = {}): FakeConfig => ({
        headers: { "Content-Type": "application/json" },
        ...override,
      }),
      createClient: (config: FakeConfig) => {
        seen.push(config)
        return { config }
      },
    },
  }
}

function tokenEndpoint(token: string) {
  return vi.fn(async () =>
    new Response(JSON.stringify({ access_token: token }), { status: 200 }),
  ) as unknown as typeof fetch
}

describe("createConfiguredClient", () => {
  it("wires baseUrl, an auth callback and a composed fetch onto the client's config", async () => {
    const { factories, seen } = fakeFactories()

    createConfiguredClient(factories, {
      baseUrl: "https://euwest.api.elasticpath.com",
      token: "pre-issued",
    })

    const config = seen[0]!
    expect(config.baseUrl).toBe("https://euwest.api.elasticpath.com")
    expect(typeof config.fetch).toBe("function")
    expect(await (config.auth as () => Promise<string>)()).toBe("pre-issued")
    // The generated defaults survive: createConfig ran, not a replacement for it.
    expect(config.headers).toEqual({ "Content-Type": "application/json" })
  })

  it("puts a bearer token on the wire and retries a 429", async () => {
    const { factories, seen } = fakeFactories()
    const statuses = [429, 200]
    let call = 0
    const authorizations: Array<string | null> = []
    const transport = vi.fn(async (request: Request) => {
      authorizations.push(request.headers.get("Authorization"))
      const status = statuses[Math.min(call, statuses.length - 1)]!
      call += 1
      return new Response("payload", { status })
    }) as unknown as typeof fetch

    createConfiguredClient(factories, {
      baseUrl: "https://euwest.api.elasticpath.com",
      token: "pre-issued",
      fetch: transport,
      retry: { sleep: async () => {}, now: () => 0, rng: () => 0 },
    })

    const response = await seen[0]!.fetch!("https://euwest.api.elasticpath.com/pcm/pricebooks")

    expect(response.status).toBe(200)
    expect(authorizations).toEqual(["Bearer pre-issued", "Bearer pre-issued"])
  })

  it("keeps the auth wrapper inside the retry wrapper", async () => {
    const { factories, seen } = fakeFactories()
    const authorizations: Array<string | null> = []
    let call = 0
    const transport = vi.fn(async (request: Request) => {
      authorizations.push(request.headers.get("Authorization"))
      call += 1
      // First send carries the stale token, the refreshed one is accepted.
      return new Response("payload", { status: call === 1 ? 401 : 200 })
    }) as unknown as typeof fetch

    let minted = 0
    createConfiguredClient(factories, {
      baseUrl: "https://euwest.api.elasticpath.com",
      source: createTokenSource(async () => {
        minted += 1
        return { access_token: `token-${minted}` }
      }),
      fetch: transport,
      retry: { sleep: async () => {}, now: () => 0, rng: () => 0 },
    })

    const response = await seen[0]!.fetch!("https://euwest.api.elasticpath.com/pcm/pricebooks")

    expect(response.status).toBe(200)
    // Two sends, not four: the 401 was recovered below the retry layer.
    expect(authorizations).toEqual(["Bearer token-1", "Bearer token-2"])
  })

  it("mints a token from client credentials through the same transport", async () => {
    const { factories, seen } = fakeFactories()
    const endpoint = tokenEndpoint("from-client-credentials")

    createConfiguredClient(factories, {
      baseUrl: "https://euwest.api.elasticpath.com",
      clientId: "id",
      clientSecret: "secret",
      fetch: endpoint,
    })

    expect(await (seen[0]!.auth as () => Promise<string>)()).toBe("from-client-credentials")
    const [url] = (endpoint as unknown as ReturnType<typeof vi.fn>).mock.calls[0]!
    expect(url).toBe("https://euwest.api.elasticpath.com/oauth/access_token")
  })

  it("falls back to the implicit grant when there is no secret", async () => {
    const { factories, seen } = fakeFactories()
    const endpoint = tokenEndpoint("from-implicit")

    createConfiguredClient(factories, {
      baseUrl: "https://euwest.api.elasticpath.com",
      clientId: "id",
      fetch: endpoint,
    })

    expect(await (seen[0]!.auth as () => Promise<string>)()).toBe("from-implicit")
    const [, init] = (endpoint as unknown as ReturnType<typeof vi.fn>).mock.calls[0]!
    expect(String((init as RequestInit).body)).toContain("grant_type=implicit")
  })

  it("retry: false keeps authentication and drops the schedule", async () => {
    const { factories, seen } = fakeFactories()
    let call = 0
    const transport = vi.fn(async () => {
      call += 1
      return new Response("payload", { status: 429 })
    }) as unknown as typeof fetch

    createConfiguredClient(factories, {
      baseUrl: "https://euwest.api.elasticpath.com",
      token: "pre-issued",
      fetch: transport,
      retry: false,
    })

    const response = await seen[0]!.fetch!("https://euwest.api.elasticpath.com/pcm/pricebooks")

    expect(response.status).toBe(429)
    expect(call).toBe(1)
  })

  it("lets config override anything the factory chose", () => {
    const { factories, seen } = fakeFactories()

    createConfiguredClient(factories, {
      baseUrl: "https://euwest.api.elasticpath.com",
      token: "pre-issued",
      config: { throwOnError: true, headers: { "X-Trace": "abc" } },
    })

    expect(seen[0]!.throwOnError).toBe(true)
    expect(seen[0]!.headers).toEqual({ "X-Trace": "abc" })
  })

  it("hands back the token source, so a client built per request leaves nothing behind", () => {
    const { factories } = fakeFactories()
    let subscribers = 0
    const storage: StorageAdapter = {
      get: () => undefined,
      set: () => {},
      subscribe: () => {
        subscribers += 1
        return () => {
          subscribers -= 1
        }
      },
    }

    const sources: TokenSource[] = []
    for (let request = 0; request < 25; request += 1) {
      createConfiguredClient(factories, {
        baseUrl: "https://euwest.api.elasticpath.com",
        token: "pre-issued",
        storage,
        onSource: (source) => void sources.push(source),
      })
    }

    expect(subscribers).toBe(25)
    sources.forEach((source) => source.dispose())
    expect(subscribers).toBe(0)
  })

  it("refuses to build a client with no way to get a credential", () => {
    const { factories } = fakeFactories()

    expect(() =>
      createConfiguredClient(factories, { baseUrl: "https://euwest.api.elasticpath.com" }),
    ).toThrow(/needs credentials/)
  })
})
