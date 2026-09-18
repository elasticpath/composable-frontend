# @epcc-sdk/sdks-auth

OAuth helpers for the Elastic Path generated SDKs. Every consumer of an
`@epcc-sdk/*` package currently hand-rolls the same token cache, the same
`Authorization` header and the same 401 retry. This package is that code, once.

It has **zero runtime dependencies** and does not import any generated client, so
it works against any generator version and in both Node and the browser.

```sh
npm install @epcc-sdk/sdks-auth
```

## The four pieces

| Piece | What it decides |
| --- | --- |
| **Provider** | how a token is obtained (`clientCredentialsProvider`, `implicitProvider`, `staticTokenProvider`) |
| **Storage adapter** | where it lives (`memoryStorage`, `localStorageAdapter`) |
| **Token source** | caching, expiry, in-flight collapsing (`createTokenSource`) |
| **Client adapters** | how it reaches a generated client (`createAuthCallback`, `createRetryFetch`) |

## Read this first: `auth` and `fetch` do different jobs

A generated client already has a way to supply a token — its own `auth` hook.
This package does not replace it. `createRetryFetch` exists for the one thing no
generated client does: **retry a 401**.

| | `auth: createAuthCallback(source)` | `fetch: createRetryFetch(source)` |
| --- | --- | --- |
| Supplies the token | yes, this is the supported hook | only as a fallback, when there is no `auth` hook |
| Adds the `Bearer ` prefix | the client does, per the operation's security scheme | the adapter does |
| Retries a 401 | **no. Nothing in a generated client retries anything** | **yes, once, with a forced refresh** |

So a real consumer wires **both**, to **one** source. `auth` puts the header on
the wire; `fetch` is the only layer that sees the response, so it is the only
layer that can notice a 401 and replay the request.

**Why the two do not cancel out.** Because `auth` runs first, `createRetryFetch`
always sees a request that already carries an `Authorization` header. The obvious
rule — "never touch a header the caller set" — would make the retry dead code. So
the adapter compares the incoming header against `Bearer ${source.peek()}`
instead:

- **a match** is this source's own token, placed by the `auth` hook. Left alone
  on the way out, refreshed and replayed on a 401.
- **anything else** is a credential this source did not issue. Passed through
  untouched and *not* retried, because there is nothing better to put in its
  place.

That check is also why both must be built from the *same* `TokenSource` — two
sources would each see the other's token as foreign.

## 1. Server, client credentials

The back-office case: a Node process with a client secret. This grant carries a
secret, so it must never run in a browser.

```ts
import { createClient, createConfig } from "@epcc-sdk/sdks-pricebooks/client"
import {
  clientCredentialsProvider,
  createAuthCallback,
  createRetryFetch,
  createTokenSource,
} from "@epcc-sdk/sdks-auth"

const baseUrl = "https://euwest.api.elasticpath.com"

const source = createTokenSource(
  clientCredentialsProvider({
    baseUrl,
    clientId: process.env.EPCC_CLIENT_ID!,
    clientSecret: process.env.EPCC_CLIENT_SECRET!,
  }),
  // Refresh 5 minutes before the token actually expires.
  { leewaySeconds: 300 },
)

const client = createClient(
  createConfig({
    baseUrl,
    auth: createAuthCallback(source),
    fetch: createRetryFetch(source),
  }),
)
```

Both adapters come from the one `source`, which is what makes the ownership check
work. `createRetryFetch` alone is enough if your client has no `auth` hook — it
sets the header itself.

## 2. Browser, implicit

The storefront case: no secret, and the token survives a reload and stays in step
across tabs.

```ts
import {
  createAuthCallback,
  createTokenSource,
  implicitProvider,
  localStorageAdapter,
} from "@epcc-sdk/sdks-auth"

const source = createTokenSource(
  implicitProvider({
    baseUrl: "https://euwest.api.elasticpath.com",
    clientId: process.env.NEXT_PUBLIC_EPCC_CLIENT_ID!,
  }),
  { storage: localStorageAdapter() },
)

const auth = createAuthCallback(source)
```

`localStorageAdapter` guards every access, so importing it during server
rendering is safe: it reads and writes nothing there. `memoryStorage` is the
default and is the right answer on a server, where a token must not outlive the
process.

## Errors: `reason` and your own vocabulary

Every token-request failure rejects with a `TokenRequestError`. `reason` says
which kind it was, so you can switch on it instead of inferring the kind from the
status code:

| `reason` | What happened | `status` | `body` |
| --- | --- | --- | --- |
| `http` | the endpoint answered with a non-2xx | the response status | what the endpoint said |
| `parse` | a 2xx whose body is not JSON (a gateway or login page in front of the API) | `200`-ish | the raw body |
| `missing_token` | a 2xx carrying valid JSON with no `access_token` | `200`-ish | the raw body |
| `network` | no response at all: DNS, TLS, a dropped connection, an abort | `0` | `""` |

`network` also carries `cause`, whatever `fetch` threw. The two 2xx cases are the
point: a status check alone calls them a success.

If your codebase already has an authentication error type, do not write a
translator around the provider. Pass `mapError` on the grant options; whatever it
returns is thrown in place of `TokenRequestError`.

```ts
class AuthenticationError extends Error {}

const provider = clientCredentialsProvider({
  baseUrl,
  clientId,
  clientSecret,
  mapError: (failure) =>
    new AuthenticationError(
      failure.reason === "http"
        ? `Authentication failed (${failure.status}): ${failure.body}`
        : `Authentication request failed: ${failure.message}`,
    ),
})
```

The hook receives a plain `TokenRequestFailure` — `{ reason, status, body, url,
message, cause? }` — so your error module need not import this package's error
class. It is called for every failure kind; return nothing for a case you do not
want to handle and the `TokenRequestError` is thrown for it unchanged. Throwing
from inside the hook works too. `mapError` lives on `GrantOptions`, so it applies
to `clientCredentialsProvider` and `implicitProvider` alike.

## Behaviour worth knowing

- **Expiry.** `expires_in` (seconds from now, what client credentials returns)
  wins, then `expires` (absolute), then a JWT `exp` claim. A token with none of
  the three is kept until something invalidates it — a 401 is then what discovers
  the expiry. Default leeway is 60 seconds, `leewaySeconds` changes it.
- **One request at a time.** Concurrent callers on one source share a single
  token request. Two sources share nothing.
- **Failures are not cached.** The next call retries.
- **401 retry, once.** A second 401 is returned to the caller, not thrown, and so
  is the original 401 if the refresh itself fails. `createRetryFetch` stays a
  well-behaved `fetch`.
- **No loops.** A request whose URL contains `/oauth/` never gets a token.
  Override with `isAuthRequest`.
- **Form field order.** The token request emits `client_id`, `client_secret`,
  `grant_type` in that order — the order every hand-rolled Elastic Path client
  uses — so migrating onto this package produces no diff on the wire.
- **Your header wins.** An `Authorization` header this source did not issue is
  never replaced, and such a request is not retried either.

### The 401 retry and request bodies

`createRetryFetch` clones the request **before** the first send and retries from
the clone. Constructing a `Request` from a `Request` consumes the original's
body, so a retry rebuilt from the already-sent request throws `TypeError: Cannot
construct a Request with a Request object that has already been used`. The retry
in `@epcc-sdk/sdks-shopper`'s internal `makeAuthFetch` has that shape, so its 401
retry has never worked for POST, PUT or PATCH — the throw is swallowed and the
original 401 returned. `src/client-adapters.test.ts` pins both the fix and the
root cause.

### Why a fetch wrapper and not an interceptor

The generated client has request and response interceptors, and a 401 retry looks
like it belongs in one. It does not. A response interceptor has to rebuild the
request from `opts.serializedBody`, which is typed `string` but holds the
`FormData` instance on a multipart upload: the rebuild re-serializes it with a
fresh boundary while the copied `Content-Type` still names the old one, so the
replay is the same byte count, raises no error, and the server reads zero parts.
A pair of interceptors stashing a clone avoids that, but costs a WeakMap and an
ordering contract between the two, does not cover the `client.sse.*` path, and
lets any response interceptor registered earlier record a 401 the caller never
saw — phantom failures in logging and metrics. The wrapper is about ten lines,
sits under everything the client sends, and hides a recovered 401 from the rest
of the stack.

### `options.fetch` is a policy seam, not just a testing seam

`createRetryFetch(source, { fetch })` is the only injection point that sits
**inside** the retry: the first attempt *and* the replay go through the `fetch`
you pass. So it is the place for response policy that must run before the retry
decides anything.

The worked example is pre-issued bearer tokens. `staticTokenProvider` correctly
cannot refresh, so a 401 against it is final — but the adapter's contract is to
*return* the second 401, and a consumer may need to **throw** on the first one,
with no refresh and no second network call. Put the check in the transport and
the retry never starts:

```ts
const transport: typeof fetch = async (input, init) => {
  const response = await fetch(input, init)
  if (bearerToken && response.status === 401) {
    throw new MyAuthError("Bearer token rejected. Check EPCC_BEARER_TOKEN.")
  }
  return response
}

const retryFetch = createRetryFetch(source, { fetch: transport })
```

The throw happens downstream of the adapter's own call, so it propagates before
the 401 branch is reached: one fetch call, no token-endpoint call. The same seam
takes a proxy, a retry-after handler, or request logging.

### `(url, init)` is normalised into a single `Request`

`createRetryFetch` accepts both call shapes but forwards **one `Request`**. A call
of `retryFetch(url, init)` reaches your transport — and your test spies — as
`baseFetch(request)`. Invisible in production, because a generated client always
calls its configured `fetch` with a bare `Request` already; very visible when
migrating a hand-rolled auth fetch, where assertions have to move from the init
argument to the `Request`:

```ts
expect(calls[0]![1].headers.Authorization)        // before
expect(calls[0]![0].headers.get("Authorization")) // after
```

## Not implemented: JWT / token exchange

There is no JWT or token-exchange grant here yet. Adding one is additive, not
breaking, because a `TokenProvider` is a plain function:

```ts
type TokenProvider = (ctx: { current?: string }) => Promise<TokenResponse>
```

The seam is `src/providers.ts`. `postTokenRequest` already takes an arbitrary set
of form fields, so a `tokenExchangeProvider` is a new caller of it beside
`clientCredentialsProvider` and `implicitProvider` — no change to the token
source, the storage adapters or the client adapters. `ctx.current` carries the
token being replaced, which is what an exchange grant needs. Until then,
`staticTokenProvider` takes a token you minted yourself.

## No cookie storage

Deliberately omitted. A JS-readable cookie holding a bearer token is exposed to
any XSS on the page, cookies have no cross-tab change event so `subscribe` would
silently do nothing, and the case that actually wants cookies — an httpOnly
cookie read on the server — needs a request-scoped API that `document.cookie`
cannot provide. `StorageAdapter` is three methods, so bring your own:

```ts
const adapter: StorageAdapter = {
  get: () => cookies().get("token")?.value,
  set: (value) => (value ? cookies().set("token", value) : cookies().delete("token")),
}
```
