---
"@epcc-sdk/sdks-auth": minor
---

Add `@epcc-sdk/sdks-auth`, a service-agnostic authentication helper package for
consumers of the generated SDKs.

It provides token providers for the client credentials and implicit grants plus
a static pre-issued token, in-memory and localStorage adapters, a token source
that caches a token and collapses concurrent callers onto one request, and two
adapters onto a generated client: `createAuthCallback` for the client's `auth`
hook and `createAuthFetch` for the `Authorization` header and a single 401
retry.

It has no runtime dependencies and imports no generated client, so it works
against any generator version, in Node for server-side client credentials and in
the browser for the implicit grant.

`createAuthFetch` clones a request before the first send and retries from the
clone. Rebuilding a `Request` from a `Request` that has already been sent throws,
because the first construction consumes the body, which is why the equivalent
retry inside `@epcc-sdk/sdks-shopper` never worked for requests with a body.
