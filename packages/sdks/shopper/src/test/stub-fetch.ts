import { vi } from "vitest"

export type Route = (request: Request, seen: Request[]) => Response

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export function stubFetch(route: Route) {
  const requests: Request[] = []
  const transport = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const request =
        input instanceof Request && init === undefined
          ? input
          : new Request(input, init)
      requests.push(request)
      return route(request, requests)
    },
  ) as unknown as typeof fetch
  return { requests, transport }
}

export const isTokenRequest = (request: Request) =>
  new URL(request.url).pathname === "/oauth/access_token"

export function implicitTokenEndpoint(
  respond: (seen: Request[]) => Response,
): Route {
  let minted = 0
  return (request, seen) => {
    if (isTokenRequest(request)) {
      minted += 1
      return json({
        access_token: `implicit-${minted}`,
        token_type: "Bearer",
        expires: Math.floor(Date.now() / 1000) + 3600,
      })
    }
    return respond(seen.filter((r) => !isTokenRequest(r)))
  }
}
