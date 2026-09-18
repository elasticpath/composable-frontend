---
"@epcc-sdk/sdks-runtime": minor
---

Add `@epcc-sdk/sdks-runtime`, a service-agnostic runtime helper package for
consumers of the generated SDKs.

It provides token providers for the client credentials and implicit grants plus
a static pre-issued token, in-memory and localStorage adapters, a token source
that caches a token and collapses concurrent callers onto one request, two
adapters onto a generated client (`createAuthCallback` for the client's `auth`
hook and `createAuthenticatedFetch` for the `Authorization` header and a single
401 retry), a general retry wrapper with exponential backoff, and a client
factory that wires all of it together.

`createConfiguredClient({ createClient, createConfig }, options)` takes a
generated package's own factories plus credentials and returns a client with the
token source, the `auth` hook and the composed `fetch` already set. Each SDK
package binds it in about three lines, so a consumer installs one package and
calls one function. `options.onSource` hands back the token source the call
used, which is how a caller who did not build the source reaches `clear()` and
`dispose()` on it.

`createRetryFetch` implements RFC 9110 §9.2.2 by method: 408 and 429 are
retried on any method because the origin said it did not process the request;
500, 502, 503 and 504 and ambiguous transport failures only on idempotent
methods, because replaying a POST that the origin applied but whose response was
lost creates a duplicate and reports success; and `ECONNREFUSED`, `ENOTFOUND`,
`EAI_AGAIN`, `ENETUNREACH` and `EHOSTUNREACH` on any method, because no
connection was established so nothing can have been applied. 401 is never
retried, because that failure belongs to the auth wrapper alone. An abort is
never retried either, and an abort during a wait ends the wait. Defaults are
three attempts, a 500 ms base, a 20 s cap, full jitter and a 30 s deadline.
`Retry-After` is honoured in both the delay-seconds and HTTP-date forms and is
preferred over the computed curve, clamped at `maxRetryAfterMs`, which defaults
to `maxDelayMs` so that no source of a wait outlasts another and a clamped wait
still fits inside the deadline. The wrapper is also published on the
`@epcc-sdk/sdks-runtime/retry` subpath so a consumer who only wants backoff does
not pull the token machinery.

`src/retry.test.ts` measures the method rule against an origin where every 5xx
is also a write the origin applied: the shipped policy makes one write and
returns the 503, and a policy that keys on status alone makes three writes and
returns 201.

The composition order is load-bearing: the auth wrapper goes inside the retry
wrapper, `createRetryFetch({ fetch: createAuthenticatedFetch(source) })`. Both
wrappers are `fetch`-shaped and take a `fetch`, so the opposite nesting
compiles, and it makes attempts multiply — six requests instead of two for one
401 recovery — and lets the retry layer spend its whole budget replaying a dead
token. `src/composition.test.ts` pins both orders.

It has one runtime dependency, `@epcc-sdk/authentication`, which owns the token
endpoint and has no dependencies of its own. It imports no generated API client,
so it works against any generator version, in Node for server-side client
credentials and in the browser for the implicit grant.

`createAuthenticatedFetch` clones a request before the first send and retries
from the clone. Rebuilding a `Request` from a `Request` that has already been
sent throws, because the first construction consumes the body, which is why the
equivalent retry inside `@epcc-sdk/sdks-shopper` never worked for requests with
a body. `src/client-adapters.test.ts` also pins the silent variant: rebuilding a
multipart upload from its `FormData` body re-serializes it under a new boundary
while the copied `Content-Type` header still names the old one, so the request
is well-formed, the same size, and carries no readable file.

The 401 retry decides ownership with `TokenSource.owns(token)`, which answers
for every token the source issued recently rather than for the one value
`peek()` happens to hold. A source that rotated between the `auth` hook stamping
the header and the request being sent still owns the older token, and during a
forced refresh it holds nothing at all. The remembered set is bounded at eight.

Concurrent forced refreshes coalesce onto one token request, one per generation,
so three 401s arriving together produce one call to the token endpoint and all
three replays carry the token that call wrote to the cache.

`TokenSource.dispose()` releases the subscription the source takes out on its
storage adapter. Without it, a process that builds one client per request
against a shared adapter leaks a callback for every client.

`TokenRequestError` carries a `reason` of `http`, `parse`, `missing_token` or
`network` alongside `status`, `body` and `url`, so a caller can tell a rejected
credential from a 200 carrying junk without inferring it from the status code.
`GrantOptions.mapError` takes that failure detail and returns an error of the
caller's own vocabulary to throw instead, so a consumer with an existing
authentication error type needs no translation layer.
