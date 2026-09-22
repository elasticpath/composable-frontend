# @epcc-sdk/sdks-catalogs

## 0.1.0

### Minor Changes

- 5cb6f535: Add `@epcc-sdk/sdks-catalogs`, a generated client for the admin catalogs API.

  It covers all 30 operations under `/catalogs`: catalogs and catalog rules, release
  publishing, and the hierarchies, nodes and products inside a release. Like
  `@epcc-sdk/sdks-pricebooks`, it bundles `@epcc-sdk/sdks-runtime`, so `createCatalogsClient`
  gives you a client that holds a token, refreshes it on a 401 and backs off on a 429 from one
  install. Zod schemas are on the `/zod` subpath so the main entry never imports zod.

  The operations come from `specs/catalog_view.yaml`, which carries both the shopper catalog view
  and the admin catalogs API; `catalogs@v1` in `specs/config/redocly.yaml` selects the admin half.
  `@epcc-sdk/sdks-shopper` is unchanged.
