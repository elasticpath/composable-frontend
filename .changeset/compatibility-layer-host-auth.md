---
"@epcc-sdk/compatibility-layer": minor
---

Let a host app with its own login share auth and headers with the compatibility layer.

- `clientRegistry.getOrCreate` takes a `tokenProvider` for the `password`, `sso` and `jwt` auth types, and a `tokenFetch` for the `implicit` and `client_credentials` token requests.
- If the configuration for a name changes, `getOrCreate` replaces the entry. It compares functions by identity, so pass stable functions.
- `getHeaders` adds headers to each request from `createBridgedFetch` and the registry. A request opts out with the query parameter that `skipHeadersParam` names. `createBridgedClient` ignores `getHeaders`.
- `retry.reauthOn403` refreshes the token and retries a request once on a 403. The default is `false`.
- The auth state reads storage on each call, so it sees a token that the legacy SDK writes in the same tab.
- A missing `expires` value means the expiry is unknown, not expired. An `expires` value above 10^11 is read as milliseconds.
- If the token provider throws, the request is sent with the stored token. A request that sets its own `Authorization` header is not refreshed on a 401.
- The package no longer declares a peer dependency on `@hey-api/client-fetch`.
