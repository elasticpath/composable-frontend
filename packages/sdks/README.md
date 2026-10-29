# Elastic Path SDKs

TypeScript clients for the Elastic Path Composable Commerce APIs. The clients are generated from the OpenAPI specs that Elastic Path publishes. The [examples](../../examples/README.md) in this repository use these packages.

Most packages are for one API. You install only the packages for the APIs that you call.

The shopper package is different. It contains the APIs that a storefront usually calls, in one package. It also manages the shopper token in the browser.

Each API client package contains:

- A typed function for each operation, with typed responses and errors.
- Zod schemas in the `./zod` export. You can use them to validate requests and responses.
- A Fetch client. Use the `client` export, or call `createClient` to make a separate client.
- MCP tools in the `./mcp` export. The shopper package has React Query hooks in the `./react-query` export instead.

The `authentication`, `nextjs` and `runtime` packages are helpers for the clients. They manage tokens, storage, retries and the Next.js integration.

## Packages

| Package                                                    | npm                                                                                                            |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [accounts](accounts/README.md)                             | [`@epcc-sdk/sdks-accounts`](https://www.npmjs.com/package/@epcc-sdk/sdks-accounts)                             |
| [accounts-addresses](accounts-addresses/README.md)         | [`@epcc-sdk/sdks-accounts-addresses`](https://www.npmjs.com/package/@epcc-sdk/sdks-accounts-addresses)         |
| [application-keys](application-keys/README.md)             | [`@epcc-sdk/sdks-application-keys`](https://www.npmjs.com/package/@epcc-sdk/sdks-application-keys)             |
| [authentication](authentication/README.md)                 | [`@epcc-sdk/authentication`](https://www.npmjs.com/package/@epcc-sdk/authentication)                           |
| [authentication-realms](authentication-realms/README.md)   | [`@epcc-sdk/sdks-authentication-realms`](https://www.npmjs.com/package/@epcc-sdk/sdks-authentication-realms)   |
| [cart-checkout-order](cart-checkout-order/README.md)       | [`@epcc-sdk/sdks-cart-checkout-order`](https://www.npmjs.com/package/@epcc-sdk/sdks-cart-checkout-order)       |
| [catalog-search](catalog-search/README.md)                 | [`@epcc-sdk/sdks-catalog-search`](https://www.npmjs.com/package/@epcc-sdk/sdks-catalog-search)                 |
| [catalogs](catalogs/README.md)                             | [`@epcc-sdk/sdks-catalogs`](https://www.npmjs.com/package/@epcc-sdk/sdks-catalogs)                             |
| [commerce-extensions](commerce-extensions/README.md)       | [`@epcc-sdk/commerce-extensions`](https://www.npmjs.com/package/@epcc-sdk/commerce-extensions)                 |
| [currencies](currencies/README.md)                         | [`@epcc-sdk/sdks-currencies`](https://www.npmjs.com/package/@epcc-sdk/sdks-currencies)                         |
| [files](files/README.md)                                   | [`@epcc-sdk/sdks-files`](https://www.npmjs.com/package/@epcc-sdk/sdks-files)                                   |
| [flows](flows/README.md)                                   | [`@epcc-sdk/flows`](https://www.npmjs.com/package/@epcc-sdk/flows)                                             |
| [integrations](integrations/README.md)                     | [`@epcc-sdk/integrations`](https://www.npmjs.com/package/@epcc-sdk/integrations)                               |
| [inventories](inventories/README.md)                       | [`@epcc-sdk/sdks-inventories`](https://www.npmjs.com/package/@epcc-sdk/sdks-inventories)                       |
| [merchant-realm-mapping](merchant-realm-mapping/README.md) | [`@epcc-sdk/sdks-merchant-realm-mapping`](https://www.npmjs.com/package/@epcc-sdk/sdks-merchant-realm-mapping) |
| [nextjs](nextjs/README.md)                                 | [`@epcc-sdk/sdks-nextjs`](https://www.npmjs.com/package/@epcc-sdk/sdks-nextjs)                                 |
| [payments](payments/README.md)                             | [`@epcc-sdk/payments`](https://www.npmjs.com/package/@epcc-sdk/payments)                                       |
| [permissions](permissions/README.md)                       | [`@epcc-sdk/permissions`](https://www.npmjs.com/package/@epcc-sdk/permissions)                                 |
| [personal-data](personal-data/README.md)                   | [`@epcc-sdk/personal-data`](https://www.npmjs.com/package/@epcc-sdk/personal-data)                             |
| [pim](pim/README.md)                                       | [`@epcc-sdk/sdks-pxm`](https://www.npmjs.com/package/@epcc-sdk/sdks-pxm)                                       |
| [pricebooks](pricebooks/README.md)                         | [`@epcc-sdk/sdks-pricebooks`](https://www.npmjs.com/package/@epcc-sdk/sdks-pricebooks)                         |
| [promotions-standard](promotions-standard/README.md)       | [`@epcc-sdk/promotions-standard`](https://www.npmjs.com/package/@epcc-sdk/promotions-standard)                 |
| [rule-promotions](rule-promotions/README.md)               | [`@epcc-sdk/rule-promotions`](https://www.npmjs.com/package/@epcc-sdk/rule-promotions)                         |
| [runtime](runtime/README.md)                               | [`@epcc-sdk/sdks-runtime`](https://www.npmjs.com/package/@epcc-sdk/sdks-runtime)                               |
| [settings](settings/README.md)                             | [`@epcc-sdk/settings`](https://www.npmjs.com/package/@epcc-sdk/settings)                                       |
| [shopper](shopper/README.md)                               | [`@epcc-sdk/sdks-shopper`](https://www.npmjs.com/package/@epcc-sdk/sdks-shopper)                               |
| [subscriptions](subscriptions/README.md)                   | [`@epcc-sdk/sdks-subscriptions`](https://www.npmjs.com/package/@epcc-sdk/sdks-subscriptions)                   |

Each package README tells you how to install the package, set up the client and authenticate. It also lists all the operations of the package.

## Versioning

Most packages have a `0.x` version. In a `0.x` version, a minor release can contain a breaking change. This usually occurs when the API spec changes. Each package has a `CHANGELOG.md` that lists the changes in each release.

1. Use a version range that you tested.
2. Before you upgrade to a new minor version, read the changelog.

## Generator helpers

The `openapi-ts.config.ts` files of the packages share the resolvers and plugins in `specs/heyapi/`. Each helper has a test that generates a fixture, so a generator upgrade that changes the output fails the test.

### `int64AsNumber`

The Zod plugin parses `int64` and `uint64` fields as `bigint`, but the API and the TypeScript types use `number`. This resolver makes the `/zod` schemas parse these fields as `number`. In each configuration, the `typescript` and `sdk` plugins must come before `zod`. Test: `pim/test/int64-as-number.test.ts`.

### `nullableIntersection`

For a schema that is `nullable`, has a `oneOf`, and has shared `properties`, the generated type drops `null`. The Zod schema accepts `null`. This resolver adds `| null` to the type, so the type agrees with the API. The subscriptions package uses it. Test: `subscriptions/test/nullable-intersection.test.ts`.

### `mcpTools`

This plugin writes `src/client/mcp.gen.ts`. The file has one MCP tool factory for each operation, such as `getCatalogsTool`, and a `tools(options)` function that returns all the tools. Each factory returns the arguments for `McpServer.registerTool` from MCP SDK v2 (`@modelcontextprotocol/server`). The plugin copies `specs/heyapi/mcp-tools-support.ts` to `src/client/mcp-support.gen.ts`.

To add MCP tools to a package:

1. Add `mcpTools($, { api: "<package>" })` to the plugins in `openapi-ts.config.ts`.
2. Add `src/mcp.ts` and a `./mcp` export. Use the catalogs package as the model.
3. Add `test/mcp-generation.test.ts`. Use `catalogs/test/mcp-generation.test.ts` as the model.

The tool name is `<api>_<snake_case_function>`, with 64 characters at most. The description is the operation summary and the first paragraph of the spec description, with 600 characters at most. To change a tool, add an override file at `specs/overrides/mcp/<package>/<operationId>.yaml` and list it in `specs/config/redocly.yaml`. These overrides are available:

- `x-mcp-name`, `x-mcp-title` and `x-mcp-description` replace the default text.
- `x-mcp-risk` replaces the risk tier that the HTTP method sets. The risk tier sets the tool annotations.
- `x-mcp-max-file-bytes` sets the largest file that an upload tool accepts. An upload operation must have it.

If a tool uses one large schema in more than one place, the listed input schema puts it in `$defs` and refers to it with `$ref`. Before you use such a tool, make sure that your MCP client supports `$ref`.

#### File uploads

An operation with a `multipart/form-data` body becomes a tool that takes each file as a `data:` URI string, for example `data:text/csv;base64,…`. An optional `<field>_name` argument gives the file name. If the value is not a `data:` URI, is malformed, or is larger than the limit, the tool returns an error result and sends nothing. The tool never downloads a URL.

The `data:` URI format and the `x-mcp-file` field marker come from [SEP-2356](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2356).

## Support

If you need help with the SDKs, contact Elastic Path support. To report a bug or to request a change, open an issue in this repository.
