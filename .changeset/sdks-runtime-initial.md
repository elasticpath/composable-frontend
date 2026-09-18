---
"@epcc-sdk/sdks-runtime": minor
---

Add `@epcc-sdk/sdks-runtime`, a service-agnostic authentication helper package for
consumers of the generated SDKs.

It provides token providers for the client credentials and implicit grants plus
a static pre-issued token, in-memory and localStorage adapters, a token source
that caches a token and collapses concurrent callers onto one request, and two
adapters onto a generated client: `createAuthCallback` for the client's `auth`
hook and `createRetryFetch` for the `Authorization` header and a single 401
retry. A consumer wires both to one source: `auth` is the supported way to
supply a token, and `createRetryFetch` exists for the 401 retry that no generated
client performs. The adapter compares an incoming `Authorization` header against
its own cached token so the retry stays live even though the `auth` hook set the
header first.

It has no runtime dependencies and imports no generated client, so it works
against any generator version, in Node for server-side client credentials and in
the browser for the implicit grant.

`createRetryFetch` clones a request before the first send and retries from the
clone. Rebuilding a `Request` from a `Request` that has already been sent throws,
because the first construction consumes the body, which is why the equivalent
retry inside `@epcc-sdk/sdks-shopper` never worked for requests with a body.

`TokenRequestError` carries a `reason` of `http`, `parse`, `missing_token` or
`network` alongside `status`, `body` and `url`, so a caller can tell a rejected
credential from a 200 carrying junk without inferring it from the status code.
`GrantOptions.mapError` takes that failure detail and returns an error of the
caller's own vocabulary to throw instead, so a consumer with an existing
authentication error type does not write a translator around the provider.

The token request emits its form fields as `client_id`, `client_secret`,
`grant_type`, matching every hand-rolled Elastic Path client, so adopting this
package changes nothing on the wire.
