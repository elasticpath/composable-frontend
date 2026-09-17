import { describe, expect, it, vi } from "vitest"
import { TokenRequestError } from "./errors"
import {
  clientCredentialsProvider,
  implicitProvider,
  staticTokenProvider,
} from "./providers"

function jsonFetch(body: unknown, init: ResponseInit = { status: 200 }) {
  return vi.fn(
    async (_url: string, _requestInit: RequestInit) =>
      new Response(typeof body === "string" ? body : JSON.stringify(body), init),
  )
}

function formOf(mock: ReturnType<typeof jsonFetch>) {
  const [, init] = mock.mock.calls[0]!
  return new URLSearchParams(String(init.body))
}

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
    expect(fetchMock.mock.calls[0]![0]).toBe(
      "https://euwest.api.elasticpath.com/oauth/access_token",
    )
    const init = fetchMock.mock.calls[0]![1]
    expect(init.method).toBe("POST")
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    )
    const form = formOf(fetchMock)
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

    expect(fetchMock.mock.calls[0]![0]).toBe(
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

    const init = fetchMock.mock.calls[0]![1]
    expect((init.headers as Record<string, string>)["User-Agent"]).toBe(
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
    const form = formOf(fetchMock)
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
