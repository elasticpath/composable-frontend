import { describe, expect, it, vi } from "vitest"
import { TokenRequestError } from "./errors"
import type { TokenRequestFailure } from "./errors"
import {
  clientCredentialsProvider,
  implicitProvider,
  staticTokenProvider,
} from "./providers"
import type { ClientCredentialsOptions } from "./providers"

function jsonFetch(body: unknown, init: ResponseInit = { status: 200 }) {
  return vi.fn(
    async (_url: string, _requestInit: RequestInit) =>
      new Response(typeof body === "string" ? body : JSON.stringify(body), init),
  )
}

/** The generated client hands `fetch` one `Request` and no init. */
function sentRequest(mock: { mock: { calls: unknown[][] } }): Request {
  const [input, init] = mock.mock.calls[0]! as [
    RequestInfo | URL,
    RequestInit | undefined,
  ]
  return input instanceof Request && init === undefined
    ? input
    : new Request(input as RequestInfo, init)
}

async function formOf(mock: { mock: { calls: unknown[][] } }) {
  return new URLSearchParams(await bodyOf(mock))
}

function bodyOf(mock: { mock: { calls: unknown[][] } }): Promise<string> {
  return sentRequest(mock).text()
}

function throwingFetch(error: unknown) {
  return vi.fn(async () => {
    throw error
  })
}

function credentials(
  overrides: Partial<ClientCredentialsOptions>,
): ClientCredentialsOptions {
  return {
    baseUrl: "https://api.example.com",
    clientId: "id",
    clientSecret: "secret",
    ...overrides,
  }
}

class AuthenticationError extends Error {
  readonly name = "AuthenticationError"
}

const mapToAuthenticationError = (failure: TokenRequestFailure) =>
  new AuthenticationError(
    failure.reason === "http"
      ? `Authentication failed (${failure.status}): ${failure.body}`
      : `Authentication request failed: ${failure.message}`,
  )

describe("clientCredentialsProvider", () => {
  it("posts a form-encoded client_credentials grant to /oauth/access_token", async () => {
    const fetchMock = jsonFetch({ access_token: "tok", expires_in: 3600 })
    const provider = clientCredentialsProvider({
      baseUrl: "https://euwest.api.elasticpath.com",
      clientId: "id",
      clientSecret: "secret",
      fetch: fetchMock as unknown as typeof fetch,
    })

    const response = await provider({})

    expect(response.access_token).toBe("tok")
    expect(response.expires_in).toBe(3600)
    const request = sentRequest(fetchMock)
    expect(request.url).toBe(
      "https://euwest.api.elasticpath.com/oauth/access_token",
    )
    expect(request.method).toBe("POST")
    expect(request.headers.get("Content-Type")).toBe(
      "application/x-www-form-urlencoded",
    )
    const form = await formOf(fetchMock)
    expect(form.get("grant_type")).toBe("client_credentials")
    expect(form.get("client_id")).toBe("id")
    expect(form.get("client_secret")).toBe("secret")
  })

  it("strips trailing slashes from the base URL", async () => {
    const fetchMock = jsonFetch({ access_token: "tok" })
    await clientCredentialsProvider({
      baseUrl: "https://api.example.com///",
      clientId: "id",
      clientSecret: "secret",
      fetch: fetchMock as unknown as typeof fetch,
    })({})

    expect(sentRequest(fetchMock).url).toBe(
      "https://api.example.com/oauth/access_token",
    )
  })

  it("merges caller headers into the token request", async () => {
    const fetchMock = jsonFetch({ access_token: "tok" })
    await clientCredentialsProvider({
      baseUrl: "https://api.example.com",
      clientId: "id",
      clientSecret: "secret",
      headers: { "User-Agent": "elastic-path-mcp/1.0" },
      fetch: fetchMock as unknown as typeof fetch,
    })({})

    expect(sentRequest(fetchMock).headers.get("User-Agent")).toBe(
      "elastic-path-mcp/1.0",
    )
  })

  it("rejects with a TokenRequestError carrying the status and body", async () => {
    const fetchMock = jsonFetch('{"errors":[{"detail":"bad client"}]}', {
      status: 401,
    })
    const provider = clientCredentialsProvider({
      baseUrl: "https://api.example.com",
      clientId: "id",
      clientSecret: "nope",
      fetch: fetchMock as unknown as typeof fetch,
    })

    const error = await provider({}).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(TokenRequestError)
    expect((error as TokenRequestError).status).toBe(401)
    expect((error as TokenRequestError).body).toContain("bad client")
    expect((error as TokenRequestError).url).toBe(
      "https://api.example.com/oauth/access_token",
    )
  })

  it("rejects when the endpoint returns a non-JSON body", async () => {
    const fetchMock = jsonFetch("<html>gateway</html>")
    const provider = clientCredentialsProvider({
      baseUrl: "https://api.example.com",
      clientId: "id",
      clientSecret: "secret",
      fetch: fetchMock as unknown as typeof fetch,
    })

    await expect(provider({})).rejects.toBeInstanceOf(TokenRequestError)
  })

  it("rejects when a 200 carries no access_token", async () => {
    const fetchMock = jsonFetch({ token_type: "Bearer" })
    const provider = clientCredentialsProvider({
      baseUrl: "https://api.example.com",
      clientId: "id",
      clientSecret: "secret",
      fetch: fetchMock as unknown as typeof fetch,
    })

    const error = await provider({}).catch((e: unknown) => e)
    expect(error).toBeInstanceOf(TokenRequestError)
    expect((error as TokenRequestError).message).toContain("no access_token")
  })
})

describe("implicitProvider", () => {
  it("posts an implicit grant with a client id and no secret", async () => {
    const fetchMock = jsonFetch({ access_token: "shopper", expires: 1700000000 })
    const response = await implicitProvider({
      baseUrl: "https://api.example.com",
      clientId: "public-id",
      fetch: fetchMock as unknown as typeof fetch,
    })({})

    expect(response.access_token).toBe("shopper")
    const form = await formOf(fetchMock)
    expect(form.get("grant_type")).toBe("implicit")
    expect(form.get("client_id")).toBe("public-id")
    expect(form.has("client_secret")).toBe(false)
  })
})

describe("staticTokenProvider", () => {
  it("returns the token without touching the network", async () => {
    const response = await staticTokenProvider("pre-issued")({})
    expect(response).toEqual({ access_token: "pre-issued" })
  })
})

describe("OAuth form field order", () => {
  it("emits client_id, client_secret, grant_type in that exact byte order", async () => {
    const fetchMock = jsonFetch({ access_token: "tok" })
    await clientCredentialsProvider(
      credentials({ fetch: fetchMock as unknown as typeof fetch }),
    )({})

    // Pinned as literal bytes so a migrating consumer's wire diff stays empty.
    expect(await bodyOf(fetchMock)).toBe(
      "client_id=id&client_secret=secret&grant_type=client_credentials",
    )
  })

  it("emits client_id, grant_type in that exact byte order for the implicit grant", async () => {
    const fetchMock = jsonFetch({ access_token: "shopper" })
    await implicitProvider({
      baseUrl: "https://api.example.com",
      clientId: "public-id",
      fetch: fetchMock as unknown as typeof fetch,
    })({})

    expect(await bodyOf(fetchMock)).toBe(
      "client_id=public-id&grant_type=implicit",
    )
  })
})

describe("TokenRequestError.reason", () => {
  it("is 'http' when the endpoint answers with a non-2xx", async () => {
    const fetchMock = jsonFetch('{"errors":[{"detail":"bad client"}]}', {
      status: 401,
    })

    const error = (await clientCredentialsProvider(
      credentials({ fetch: fetchMock as unknown as typeof fetch }),
    )({}).catch((e: unknown) => e)) as TokenRequestError

    expect(error).toBeInstanceOf(TokenRequestError)
    expect(error.reason).toBe("http")
    expect(error.status).toBe(401)
    expect(error.body).toContain("bad client")
    expect(error.cause).toBeUndefined()
  })

  it("is 'parse' when a 200 carries a body that is not JSON", async () => {
    const fetchMock = jsonFetch("<html>gateway</html>")

    const error = (await clientCredentialsProvider(
      credentials({ fetch: fetchMock as unknown as typeof fetch }),
    )({}).catch((e: unknown) => e)) as TokenRequestError

    expect(error.reason).toBe("parse")
    expect(error.status).toBe(200)
    expect(error.body).toBe("<html>gateway</html>")
  })

  it("is 'missing_token' when a 200 carries valid JSON with no access_token", async () => {
    const fetchMock = jsonFetch({ token_type: "Bearer" })

    const error = (await clientCredentialsProvider(
      credentials({ fetch: fetchMock as unknown as typeof fetch }),
    )({}).catch((e: unknown) => e)) as TokenRequestError

    expect(error.reason).toBe("missing_token")
    expect(error.status).toBe(200)
  })

  it("is 'network' when fetch itself throws, and carries the cause", async () => {
    const thrown = new TypeError("fetch failed")
    const fetchMock = throwingFetch(thrown)

    const error = (await clientCredentialsProvider(
      credentials({ fetch: fetchMock as unknown as typeof fetch }),
    )({}).catch((e: unknown) => e)) as TokenRequestError

    expect(error).toBeInstanceOf(TokenRequestError)
    expect(error.reason).toBe("network")
    expect(error.status).toBe(0)
    expect(error.body).toBe("")
    expect(error.url).toBe("https://api.example.com/oauth/access_token")
    expect(error.message).toBe("fetch failed")
    expect(error.cause).toBe(thrown)
  })

  it("reports itself as the same detail a mapper would have received", async () => {
    const fetchMock = jsonFetch("nope", { status: 503 })

    const error = (await clientCredentialsProvider(
      credentials({ fetch: fetchMock as unknown as typeof fetch }),
    )({}).catch((e: unknown) => e)) as TokenRequestError

    expect(error.toFailure()).toEqual({
      reason: "http",
      status: 503,
      body: "nope",
      url: "https://api.example.com/oauth/access_token",
      message: "Token request failed with status 503",
    })
  })
})

describe("TokenRequestError.url", () => {
  // The client normalizes the host when it builds the `Request`, so the URL it
  // sent and a URL restated from the base and the path are different strings.
  // A failure must report the one that went out.
  const mixedCaseHost = "https://API.example.com"
  const built = "https://api.example.com/oauth/access_token"

  it("comes from the request the client built, on an HTTP failure", async () => {
    const fetchMock = jsonFetch("nope", { status: 503 })

    const error = (await clientCredentialsProvider(
      credentials({
        baseUrl: mixedCaseHost,
        fetch: fetchMock as unknown as typeof fetch,
      }),
    )({}).catch((e: unknown) => e)) as TokenRequestError

    expect(error.url).toBe(sentRequest(fetchMock).url)
    expect(error.url).toBe(built)
  })

  it("comes from the request the client built, on a transport failure", async () => {
    const fetchMock = throwingFetch(new TypeError("fetch failed"))

    const error = (await clientCredentialsProvider(
      credentials({
        baseUrl: mixedCaseHost,
        fetch: fetchMock as unknown as typeof fetch,
      }),
    )({}).catch((e: unknown) => e)) as TokenRequestError

    expect(error.reason).toBe("network")
    expect(error.url).toBe(sentRequest(fetchMock).url)
    expect(error.url).toBe(built)
  })
})

describe("mapError", () => {
  it("turns a non-2xx into the caller's own error class", async () => {
    const fetchMock = jsonFetch('{"errors":[{"detail":"bad client"}]}', {
      status: 401,
    })

    const error = (await clientCredentialsProvider(
      credentials({
        fetch: fetchMock as unknown as typeof fetch,
        mapError: mapToAuthenticationError,
      }),
    )({}).catch((e: unknown) => e)) as AuthenticationError

    expect(error).toBeInstanceOf(AuthenticationError)
    expect(error).not.toBeInstanceOf(TokenRequestError)
    expect(error.message).toBe(
      'Authentication failed (401): {"errors":[{"detail":"bad client"}]}',
    )
  })

  it("turns a malformed 200 into the caller's own error class", async () => {
    const fetchMock = jsonFetch("<html>gateway</html>")

    const error = (await clientCredentialsProvider(
      credentials({
        fetch: fetchMock as unknown as typeof fetch,
        mapError: mapToAuthenticationError,
      }),
    )({}).catch((e: unknown) => e)) as AuthenticationError

    expect(error).toBeInstanceOf(AuthenticationError)
    expect(error.message).toBe(
      "Authentication request failed: Token endpoint returned a non-JSON body",
    )
  })

  it("turns a network failure into the caller's own error class", async () => {
    const fetchMock = throwingFetch(new TypeError("fetch failed"))

    const error = (await clientCredentialsProvider(
      credentials({
        fetch: fetchMock as unknown as typeof fetch,
        mapError: mapToAuthenticationError,
      }),
    )({}).catch((e: unknown) => e)) as AuthenticationError

    expect(error).toBeInstanceOf(AuthenticationError)
    expect(error.message).toBe("Authentication request failed: fetch failed")
  })

  it("receives the failure detail once per failed request", async () => {
    const fetchMock = jsonFetch("boom", { status: 500 })
    const mapError = vi.fn(
      (_failure: TokenRequestFailure) => new AuthenticationError("mapped"),
    )

    await clientCredentialsProvider(
      credentials({ fetch: fetchMock as unknown as typeof fetch, mapError }),
    )({}).catch(() => undefined)

    expect(mapError).toHaveBeenCalledTimes(1)
    expect(mapError.mock.calls[0]![0]).toEqual({
      reason: "http",
      status: 500,
      body: "boom",
      url: "https://api.example.com/oauth/access_token",
      message: "Token request failed with status 500",
    })
  })

  it("keeps the TokenRequestError when the mapper returns nothing", async () => {
    const fetchMock = jsonFetch("boom", { status: 500 })

    const error = await clientCredentialsProvider(
      credentials({
        fetch: fetchMock as unknown as typeof fetch,
        mapError: (failure) =>
          failure.reason === "parse" ? new AuthenticationError("parsed") : undefined,
      }),
    )({}).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(TokenRequestError)
    expect((error as TokenRequestError).reason).toBe("http")
  })

  it("propagates an error the mapper throws itself", async () => {
    const fetchMock = jsonFetch("boom", { status: 500 })

    const error = await clientCredentialsProvider(
      credentials({
        fetch: fetchMock as unknown as typeof fetch,
        mapError: () => {
          throw new AuthenticationError("thrown from the hook")
        },
      }),
    )({}).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(AuthenticationError)
    expect((error as AuthenticationError).message).toBe("thrown from the hook")
  })

  it("applies to the implicit grant too, because it lives on GrantOptions", async () => {
    const fetchMock = jsonFetch("no", { status: 403 })

    const error = await implicitProvider({
      baseUrl: "https://api.example.com",
      clientId: "public-id",
      fetch: fetchMock as unknown as typeof fetch,
      mapError: mapToAuthenticationError,
    })({}).catch((e: unknown) => e)

    expect(error).toBeInstanceOf(AuthenticationError)
    expect((error as AuthenticationError).message).toBe(
      "Authentication failed (403): no",
    )
  })
})
