# @epcc-sdk/sdks-runtime

Elastic Path publishes one generated SDK package for each API service. A generated package knows how to call the endpoints. It does not know how to get an access token, and it does not send a failed request again.

This package supplies both. It has one runtime dependency, `@epcc-sdk/authentication`, which owns the token endpoint and has no dependencies of its own. It imports no generated API client, so it works with any generator version, in Node and in a browser.

```sh
npm install @epcc-sdk/sdks-runtime
```

## Quick start

Most SDK packages call this factory for you. Look for a `create*Client` function in the package for your service before you use this one.

```ts
import { createClient, createConfig } from "@epcc-sdk/sdks-pricebooks/client"
import { createConfiguredClient } from "@epcc-sdk/sdks-runtime"

const client = createConfiguredClient(
  { createClient, createConfig },
  {
    baseUrl: "https://euwest.api.elasticpath.com",
    clientId: process.env.EPCC_CLIENT_ID!,
    clientSecret: process.env.EPCC_CLIENT_SECRET!,
  },
)
```

The factory reads your credentials in this order: `source`, `provider`, `token`, then `clientId` with `clientSecret`, then `clientId` alone. Pass `source` if you need to clear the token when a user signs out. The `config` option is applied last, so it overrides any choice the factory made. Set `retry: false` to keep authentication and remove the waiting schedule. Set `fetch` to replace the transport under both wrappers, including the call to the token endpoint. Pass `onSource` to receive the token source this call used, which is how you reach `clear` and `dispose` for a source you did not build yourself.

## The parts

| Part | What it decides |
| --- | --- |
| Provider | How to get a token: `clientCredentialsProvider`, `implicitProvider`, `staticTokenProvider` |
| Storage adapter | Where the token lives: `memoryStorage`, `localStorageAdapter` |
| Token source | Caching and expiry: `createTokenSource` |
| Client adapters | How it reaches a generated client: `createAuthCallback`, `createAuthenticatedFetch` |
| Retry | What is safe to send again, and when: `createRetryFetch` |

Retry is also published on its own import path, so that you can use the waiting schedule without the token code:

```ts
import { createRetryFetch } from "@epcc-sdk/sdks-runtime/retry"
```

## Read this first: two hooks, two jobs

A generated client already has a way to supply a token. It is called the `auth` hook. This package does not replace it.

`createAuthenticatedFetch` exists for the one thing no generated client does, which is to send a request again after a 401 response.

| | `auth: createAuthCallback(source)` | `fetch: createAuthenticatedFetch(source)` |
| --- | --- | --- |
| Supplies the token | Yes. This is the supported hook | Only when the client has no `auth` hook |
| Adds the `Bearer` prefix | The client adds it | The adapter adds it |
| Sends the request again after a 401 | No. Nothing in a generated client does | Yes, once, after it gets a new token |

Use both, built from one token source. The `auth` hook puts the header on the request. The `fetch` wrapper is the only layer that sees the response, so it is the only layer that can notice a 401.

The two do not cancel each other out. Because the `auth` hook runs first, `createAuthenticatedFetch` always receives a request that already carries an `Authorization` header. A rule of "never change a header the caller set" stops the retry from ever running. The adapter therefore asks the token source whether it issued the token in that header:

1. If the source issued it, the adapter leaves the header alone, and replaces the token after a 401.
2. If the source did not issue it, another part of your code did. The adapter leaves it alone and does not send the request again, because it has nothing better to use.

The question is `source.owns(token)`. It covers every token the source issued recently, not only the token the source holds now. The difference matters. A source can replace its token between the moment the `auth` hook stamps the header and the moment the request goes out. During a forced refresh it holds no token at all. A check against one current value calls the adapter's own header foreign in both cases, and the 401 retry then never runs. A source remembers the last eight tokens it issued, which bounds the cost.

Build both adapters from the same token source. Two sources each treat the other's token as foreign.

## Server applications: the client credentials grant

Use this grant in a Node process. It carries a client secret, so it must never run in a browser.

```ts
import { createClient, createConfig } from "@epcc-sdk/sdks-pricebooks/client"
import {
  clientCredentialsProvider,
  createAuthCallback,
  createAuthenticatedFetch,
  createRetryFetch,
  createTokenSource,
} from "@epcc-sdk/sdks-runtime"

const baseUrl = "https://euwest.api.elasticpath.com"

const source = createTokenSource(
  clientCredentialsProvider({
    baseUrl,
    clientId: process.env.EPCC_CLIENT_ID!,
    clientSecret: process.env.EPCC_CLIENT_SECRET!,
  }),
  // Get a new token 5 minutes before the current one expires.
  { leewaySeconds: 300 },
)

const client = createClient(
  createConfig({
    baseUrl,
    auth: createAuthCallback(source),
    // The authentication wrapper goes inside. Read "Order of the wrappers".
    fetch: createRetryFetch({ fetch: createAuthenticatedFetch(source) }),
  }),
)
```

`createConfiguredClient` writes this for you. Write it out only when you must change something in the middle of it.

## Browser applications: the implicit grant

Use this grant in a browser. It carries no secret. The token survives a page reload and stays the same across tabs.

```ts
import {
  createAuthCallback,
  createTokenSource,
  implicitProvider,
  localStorageAdapter,
} from "@epcc-sdk/sdks-runtime"

const source = createTokenSource(
  implicitProvider({
    baseUrl: "https://euwest.api.elasticpath.com",
    clientId: process.env.NEXT_PUBLIC_EPCC_CLIENT_ID!,
  }),
  { storage: localStorageAdapter() },
)

const auth = createAuthCallback(source)
```

`localStorageAdapter` checks for browser storage before each read and write, so you can import it in server-rendered code. It reads and writes nothing on a server. `memoryStorage` is the default and is correct on a server, where a token must not outlive the process.

## Retry: what is safe to send again

`createRetryFetch` wraps a network call and adds a waiting schedule. It handles a server that is busy or broken. `createAuthenticatedFetch` handles one failure only, which is a 401. The two often appear on neighboring lines, so each name says which job it does.

```ts
import { createRetryFetch } from "@epcc-sdk/sdks-runtime/retry"

const fetchWithBackoff = createRetryFetch({
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 20_000,
  maxRetryAfterMs: 20_000,
  jitter: "full",
  deadlineMs: 30_000,
})
```

`maxAttempts` counts sends, not retries. A value of 3 sends once and retries twice. It must be an integer of 1 or more. `createRetryFetch` throws a `RangeError` for anything lower, because 0 can mean send nothing and can also mean send once and never retry. Pass 1 for a single attempt with no retry.

### The rules

| Failure | Sent again for |
| --- | --- |
| Status 408 and 429 | Any method. The server said that it did not process the request |
| Status 500, 502, 503 and 504 | Methods that are safe to repeat: GET, HEAD, PUT, DELETE, OPTIONS, TRACE |
| `ECONNREFUSED`, `ENOTFOUND`, `EAI_AGAIN`, `ENETUNREACH`, `EHOSTUNREACH` | Any method. No connection was made, so the server did nothing |
| `ECONNRESET`, `EPIPE`, socket timeouts | Methods that are safe to repeat. The request can arrive and only the response is lost |
| Status 401, 403, every other 4xx, and 501 | Nothing. These are never sent again |
| An abort from your own `AbortSignal` | Nothing. The schedule ends at once, and a wait in progress ends with it |

The difference between the two transport rows is the important part. A status 503 for a GET and a status 503 for a POST look the same from outside. The POST can create the price book and lose the response. Sending it again creates a second price book and returns a success status. RFC 9110 section 9.2.2 defines which methods are safe to repeat.

The test file `src/retry.test.ts` measures that case against an origin where every 5xx is also a write that the origin applied. The rules above make one price book and report the 503. A policy that reads the status and ignores the method makes three price books and reports success. That test is the reason these rules exist.

Status 401 is absent on purpose. `createAuthenticatedFetch` handles it. If you add 401 here, the two layers fight over the same failure. The retry layer repeats a request with a dead token until it runs out of attempts, and the authentication layer never gets to ask for a new one. The test file `src/composition.test.ts` measures this as six requests instead of two.

There is no option yet to repeat a POST. The `Idempotency-Key` header works only if the server removes duplicate requests by it, and there is no evidence that Elastic Path does. Until someone confirms it, pass your own `shouldRetryStatus` or `shouldRetryError` for an endpoint that you know is safe.

### Waiting

Each wait is longer than the last. The wait starts at `baseDelayMs`, stops growing at `maxDelayMs`, and carries a random offset: `random(0, min(cap, base × 2^n))`.

That random offset matters when many clients fail at once. Ten clients under this curve return over about four seconds. Without the offset they all return together and the server receives a second burst. Set `jitter: "equal"` to guarantee at least half of the target wait. The options `jitter: "none"` and `backoff: "decorrelated"` are also available.

The wrapper reads the `Retry-After` response header and uses it instead of its own wait. Both forms in RFC 9110 section 10.2.3 work: a number of seconds, and a date. A value it cannot read falls back to the curve. A date in the past means now.

`maxRetryAfterMs` limits a wait taken from that header. It defaults to `maxDelayMs`, which is 20 seconds, so no source of a wait can outlast another. A clamped wait also still fits inside the 30 second deadline, which a longer limit did not.

`deadlineMs` limits the whole schedule by clock time. If the next wait crosses that limit, the wrapper returns the last response instead of waiting. It will not shorten a `Retry-After` wait and send the request before the server is ready.

An `AbortSignal` on the request ends the schedule. An abort during a network call reaches you at once and the request is never sent again. An abort during a wait ends that wait. This holds for `AbortController.abort()` and for `AbortSignal.timeout()`.

`onEvent` reports each `send`, `outcome`, `wait` and `give-up`. A `give-up` event says whether the cause was `max-attempts` or `deadline`. You can replace `now`, `sleep` and `rng`, which is how the tests check the computed waits without waiting for them. A `sleep` of your own receives the request's signal as its second argument.

### Order of the wrappers

Put the authentication wrapper inside the retry wrapper.

```ts
fetch: createRetryFetch({ fetch: createAuthenticatedFetch(source) })
```

Both wrappers have the same shape and both accept a `fetch`, so the other order also compiles. It is wrong for three measured reasons.

1. The number of requests multiplies. With authentication inside, a 401 costs one extra request. With authentication outside, a 401 at the end of a schedule runs the whole schedule again: six requests and two full sets of waits for one recovery.
2. A long wait can outlive the token. With authentication inside, the attempt after a 20 second wait passes through the authentication layer, which sees the 401 and gets a new token. With authentication outside, the token cannot change for the whole schedule.
3. The retry layer must never see a raw 401. With authentication inside, it never does.

`createAuthenticatedFetch(source, { fetch })` is therefore not the place for the retry wrapper, even though it accepts a `fetch`. The test file `src/composition.test.ts` covers both orders.

### Limits

There is no retry budget. The wrapper holds no state across requests, so it cannot notice that a large share of all requests are now repeats. The Google SRE book treats that count as the main defense against a failure that spreads. This is the largest gap in this version.

The wrapper copies the request body and holds it for the whole schedule, so a large price book import stays in memory across every wait.

A `fetch` passed on a single call bypasses the wrapper, and nothing reports this.

Nothing here is tested against the live gateway. The Elastic Path API specifications document no 4xx or 5xx responses, no status 429 and no `Retry-After` header, so whether the gateway sends that header, and in which form, is unconfirmed.

## Errors

Every failed token request rejects with a `TokenRequestError`. Its `reason` field says which kind of failure it was, so that you do not have to work it out from the status code.

| `reason` | What happened | `status` | `body` |
| --- | --- | --- | --- |
| `http` | The endpoint answered with a non-2xx status | The response status | What the endpoint said |
| `parse` | A 2xx response whose body is not JSON, such as a login page in front of the API | About 200 | The raw body |
| `missing_token` | A 2xx response with valid JSON and no `access_token` | About 200 | The raw body |
| `network` | No response at all: DNS, TLS, a dropped connection, or an abort | `0` | Empty |

A `network` failure also carries `cause`, which is what the network call threw. The two 2xx cases are the reason this field exists. A check of the status alone calls both of them a success.

If your codebase has its own authentication error type, do not write a translation layer around the provider. Pass `mapError` on the grant options. Whatever it returns is thrown in place of `TokenRequestError`.

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

The hook receives a plain object of `{ reason, status, body, url, message, cause? }`, so your error module does not have to import this package. The hook runs for every kind of failure. Return nothing for a kind that you do not want to handle, and the original error is thrown for it. You can also throw from inside the hook. `mapError` works for `clientCredentialsProvider` and `implicitProvider`.

## Behavior worth knowing

Expiry is read from `expires_in` first, which is the number of seconds the client credentials grant returns. Then from `expires`, which is an absolute time. Then from the `exp` claim inside a JWT. A token with none of the three is kept until something makes it invalid, and a 401 response is then what finds the expiry. The default leeway is 60 seconds, and `leewaySeconds` changes it.

Callers that ask one source for a token at the same time share a single request. This holds for a forced refresh too. Three 401s that arrive together produce one call to the token endpoint, and all three carry the token that call wrote to the cache. Two sources share nothing.

A failed token request is not cached. The next call tries again.

The 401 retry runs once. A second 401 is returned to the caller and not thrown, and so is the first one if the request for a new token fails. `createAuthenticatedFetch` stays a normal network call.

A request whose URL contains `/oauth/` never receives a token, which prevents a loop. Change this with `isAuthRequest`.

The token request sends `client_id`, `client_secret` and `grant_type` in that order, which is the order every hand-written Elastic Path client uses. Moving to this package therefore changes nothing on the wire.

An `Authorization` header that this source did not issue is never replaced, and that request is not sent again.

### Disposing a token source

A token source subscribes to its storage adapter, so that a token written in another tab reaches it. That subscription lives until `source.dispose()` releases it, and `dispose` is safe to call twice.

The default `memoryStorage` belongs to one source, so a source that uses it leaves nothing behind. A shared adapter is different. Build one client for each request against a shared adapter, and you must dispose each source. If you do not, that adapter collects one callback for every client you ever built. `createConfiguredClient` reports its source through `onSource` for exactly this case:

```ts
const client = createConfiguredClient(
  { createClient, createConfig },
  { baseUrl, clientId, clientSecret, storage, onSource: (source) => sources.push(source) },
)
```

### The 401 retry and request bodies

`createAuthenticatedFetch` copies the request before the first send and repeats the copy. Building a `Request` from a `Request` consumes the body of the original, so a repeat built from the request that was already sent throws `TypeError: Cannot construct a Request with a Request object that has already been used`.

The retry inside `@epcc-sdk/sdks-shopper` has that shape. Its 401 retry has therefore never worked for POST, PUT or PATCH. The error is caught and the original 401 is returned. The test file `src/client-adapters.test.ts` covers both the correction and the cause.

### Why this is a wrapper and not an interceptor

The generated client can run code before a request and after a response. A 401 retry looks like it belongs there. It does not.

A response handler must rebuild the request to send it again. It rebuilds it from `opts.serializedBody`, which is declared as text but holds a `FormData` object for a file upload. The rebuilt request carries a new internal separator while the copied `Content-Type` header still names the old one. The request is the same size, nothing reports an error, and the server reads no file.

`src/client-adapters.test.ts` pins that fault. It rebuilds an upload the way a response handler must. It asserts that the separator inside the bytes is not the separator the header names. It also asserts that the copy this wrapper replays keeps the two together.

A pair of handlers that store a copy of the request avoids that fault. It costs a `WeakMap`, a rule about which handler runs first, no cover for the `client.sse.*` path, and one more problem: any response handler registered earlier records a 401 that the caller never saw. Your logs and metrics then report failures that did not happen.

The wrapper is about ten lines, runs under everything the client sends, and hides a recovered 401 from the rest of the stack.

### `options.fetch` sets policy

`createAuthenticatedFetch(source, { fetch })` is the only place that sits inside the retry. The first attempt and the repeat both go through the `fetch` that you pass. Put response policy there when it must run before the retry decides anything.

The example is a token that you minted yourself. `staticTokenProvider` cannot get a new one, so a 401 is final. The adapter returns that second 401, and your application can need to throw on the first one, with no new token request. Put the check in the transport and the retry never starts:

```ts
const transport: typeof fetch = async (input, init) => {
  const response = await fetch(input, init)
  if (bearerToken && response.status === 401) {
    throw new MyAuthError("Bearer token rejected. Check EPCC_BEARER_TOKEN.")
  }
  return response
}

const authFetch = createAuthenticatedFetch(source, { fetch: transport })
```

The throw happens below the adapter, so it propagates before the 401 branch runs. That is one network call and no token request. The same place takes a proxy or request logging. Do not put the waiting wrapper here. Read "Order of the wrappers".

### One `Request`, not a URL and options

`createAuthenticatedFetch` accepts both call shapes and forwards one `Request`. A call of `authFetch(url, init)` arrives at your transport, and at your test spies, as `baseFetch(request)`.

The token providers do the same. `@epcc-sdk/authentication` builds the token request and hands your `fetch` one `Request`.

This is invisible in production, because a generated client always calls its `fetch` with a `Request`. It is visible when you move a hand-written authentication layer onto this package, because test assertions move from the second argument to the `Request`:

```ts
expect(calls[0]![1].headers.Authorization)        // before
expect(calls[0]![0].headers.get("Authorization")) // after
```

## Not built yet: JWT and token exchange

There is no JWT grant and no token exchange grant. Adding one adds to the API and breaks nothing, because a provider is a plain function:

```ts
type TokenProvider = (ctx: { current?: string }) => Promise<TokenResponse>
```

Add it in `src/providers.ts`. `postTokenRequest` posts the fields you hand it, so a new provider is one more caller of it beside `clientCredentialsProvider` and `implicitProvider`. The generated `grant_type` field is an open `string`, so a grant the authentication specification does not list needs no change to that specification. Do not narrow `grant_type` to an enum or a union anywhere. The service accepts values the public specification does not list, and it answers an unknown value with a 400. An enum will therefore break calls that work today. Nothing in the token source, the storage adapters or the client adapters changes. The `ctx.current` field carries the token being replaced, which an exchange grant needs.

Until then, `staticTokenProvider` accepts a token that you obtained yourself.

## No cookie storage

Cookie storage is left out on purpose, for three reasons.

1. A cookie that JavaScript can read holds a bearer token where any cross-site scripting fault on the page can reach it.
2. Cookies raise no event when they change in another tab, so `subscribe` does nothing.
3. The case that wants cookies is an httpOnly cookie read on the server. That needs a per-request API, which `document.cookie` cannot give.

A storage adapter is three methods, so supply your own:

```ts
const adapter: StorageAdapter = {
  get: () => cookies().get("token")?.value,
  set: (value) => (value ? cookies().set("token", value) : cookies().delete("token")),
}
```
