---
"@epcc-sdk/sdks-accounts-addresses": minor
"@epcc-sdk/sdks-shopper": minor
---

Regenerate from the upstream `account-addresses` spec (spec version 25.1126.6886238, published 2025-11-26T19:10:23Z).

The working spec had fallen behind the published one. What the refresh restores was
verified against the service source in `commerce-cloud/addresses.svc`:

- `getV2AccountAddresses` takes `page[offset]`, `page[limit]`, `page[total_method]` and
  `filter`, and its response carries `meta.page`, `meta.results` and `links`. The service
  has read and returned all of these all along; the spec did not describe them, so the
  typed client could not reach them.
- `postV2AccountAddress` declares `201`, which is the status the service actually
  returns.
- `400` responses are declared on create, update and list.

Adds 13 exported symbols, including `PaginationPage`, `PaginationResults`,
`PaginationMeta` and `PaginationLinks`.

**Breaking.** Removes 3 exported symbols:

- `accounts-addresses: _Error` — renamed `Error`.
- `accounts-addresses: ErrorBadRequest`, `shopper: ErrorBadRequest` — the published spec
  models these as responses rather than schemas, so no type is generated under those
  names. Use `ErrorResponse`, which is unchanged in shape.
- `accounts-addresses: ErrorNotFound`, `shopper: ErrorNotFound` — likewise.

The tool also reported `accounts-addresses: client` as removed. It is not: on generator
0.99 the shared instance moves from `client/sdk.gen.ts` to `client/client.gen.ts`, and
the package root still exports it.
