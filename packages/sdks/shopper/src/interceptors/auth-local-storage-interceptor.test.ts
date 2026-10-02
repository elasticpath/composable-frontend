import { afterEach, describe, expect, it } from "vitest"
import {
  client,
  createAuthLocalStorageInterceptor,
  getByContextAllProducts,
} from "../index"
import { productListFromTheSpec } from "../test/fixtures"
import {
  implicitTokenEndpoint,
  isTokenRequest,
  json,
  stubFetch,
} from "../test/stub-fetch"

const baseUrl = "https://useast.api.elasticpath.com"
const storedCredentialsKey = "_store_ep_credentials"

const secondsFromNow = (seconds: number) =>
  Math.floor(Date.now() / 1000) + seconds

function interceptSharedClient(
  options: Parameters<typeof createAuthLocalStorageInterceptor>[0],
  route = implicitTokenEndpoint(() => json(productListFromTheSpec)),
) {
  const stub = stubFetch(route)
  client.setConfig({ baseUrl, fetch: stub.transport })
  client.interceptors.request.use(createAuthLocalStorageInterceptor(options))
  return stub
}

const operationRequests = (requests: Request[]) =>
  requests.filter((r) => !isTokenRequest(r))

afterEach(() => {
  client.interceptors.request.clear()
})

describe("createAuthLocalStorageInterceptor", () => {
  it("leaves the token request without an Authorization header", async () => {
    const { requests } = interceptSharedClient({ clientId: "client-id" })

    await getByContextAllProducts()

    const tokenRequest = requests.find(isTokenRequest)
    expect(tokenRequest!.headers.get("Authorization")).toBeNull()
  })

  it("mints and stores a token when none is stored", async () => {
    const { requests } = interceptSharedClient({ clientId: "client-id" })

    await getByContextAllProducts()

    expect(requests.filter(isTokenRequest)).toHaveLength(1)
    expect(
      JSON.parse(localStorage.getItem(storedCredentialsKey)!),
    ).toMatchObject({ access_token: "implicit-1", token_type: "Bearer" })
    expect(operationRequests(requests)[0]!.headers.get("Authorization")).toBe(
      "Bearer implicit-1",
    )
  })

  it("sends no token when none is stored and autoStoreCredentials is false", async () => {
    const { requests } = interceptSharedClient({
      clientId: "client-id",
      autoStoreCredentials: false,
    })

    await getByContextAllProducts()

    expect(requests.filter(isTokenRequest)).toHaveLength(0)
    expect(localStorage.getItem(storedCredentialsKey)).toBeNull()
    expect(requests[0]!.headers.get("Authorization")).toBeNull()
  })

  it("uses a stored token that has not expired", async () => {
    localStorage.setItem(
      storedCredentialsKey,
      JSON.stringify({ access_token: "stored", expires: secondsFromNow(3600) }),
    )
    const { requests } = interceptSharedClient({ clientId: "client-id" })

    await getByContextAllProducts()

    expect(requests.filter(isTokenRequest)).toHaveLength(0)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer stored")
  })

  it("replaces an expired token when autoRefresh is on", async () => {
    localStorage.setItem(
      storedCredentialsKey,
      JSON.stringify({ access_token: "expired", expires: secondsFromNow(-1) }),
    )
    const { requests } = interceptSharedClient({ clientId: "client-id" })

    await getByContextAllProducts()

    expect(operationRequests(requests)[0]!.headers.get("Authorization")).toBe(
      "Bearer implicit-1",
    )
    expect(
      JSON.parse(localStorage.getItem(storedCredentialsKey)!),
    ).toMatchObject({ access_token: "implicit-1" })
  })

  it("keeps sending an expired token when autoRefresh is off", async () => {
    localStorage.setItem(
      storedCredentialsKey,
      JSON.stringify({ access_token: "expired", expires: secondsFromNow(-1) }),
    )
    const { requests } = interceptSharedClient({
      clientId: "client-id",
      autoRefresh: false,
    })

    await getByContextAllProducts()

    expect(requests.filter(isTokenRequest)).toHaveLength(0)
    expect(requests[0]!.headers.get("Authorization")).toBe("Bearer expired")
  })

  it("stores the token under a custom key", async () => {
    interceptSharedClient({ clientId: "client-id", storageKey: "custom-key" })

    await getByContextAllProducts()

    expect(JSON.parse(localStorage.getItem("custom-key")!)).toMatchObject({
      access_token: "implicit-1",
    })
    expect(localStorage.getItem(storedCredentialsKey)).toBeNull()
  })

  it("fails the operation when the client ID is missing", async () => {
    const { requests } = interceptSharedClient({ clientId: "" })

    const { error } = await getByContextAllProducts()

    expect((error as Error).message).toBe("Missing storefront client id")
    expect(requests).toHaveLength(0)
  })

  it("fails the operation when the token request fails", async () => {
    const { requests } = interceptSharedClient({ clientId: "client-id" }, () =>
      json({ errors: [] }, 400),
    )

    const { error } = await getByContextAllProducts()

    expect((error as Error).message).toBe("Failed to get access token")
    expect(requests.every(isTokenRequest)).toBe(true)
  })
})
