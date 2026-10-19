# Elastic Path SDKs (Next Generation)

> ⚠️ **Work in Progress**: These TypeScript SDKs are currently under active development and represent the next generation of Elastic Path's client libraries. They are not yet ready for production use.

## Overview

This package contains the next version of Elastic Path's TypeScript SDKs, built from the ground up to provide:

- Improved type safety and TypeScript support
- Better performance and smaller bundle sizes
- Consistent API across different platforms
- Enhanced developer experience

## Status

These SDKs are currently in development and should be considered alpha quality. We recommend using our current stable SDKs for production applications:

- [JavaScript SDK](https://www.npmjs.com/package/@elasticpath/js-sdk)

## Generator helpers

Resolvers and plugins shared by the packages' `openapi-ts.config.ts` live in `specs/heyapi/`.

### `int64AsNumber`

The Zod plugin emits `z.coerce.bigint()` for `int64` and `uint64` fields, while the generated TypeScript types and the API's JSON use `number`. `int64AsNumber` makes the `/zod` schemas parse those fields as `number`, with a string such as a query string value converted first.

- It clears `schema.format` on the schema it handles. The plugin builds the default value from `meta.format` after the resolver has run, and for `int64` that default is a `BigInt(...)`. Clearing the format is the only way to stop it.
- It relies on `typescript` and `sdk` running before `zod` in each config's plugin list. Those plugins have already read the format by the time `zod` clears it.
- `pim/test/int64-as-number.test.ts` generates a fixture with the helper and checks the result, so a generator upgrade that changes either behavior fails the test.

### `mcpTools`

`specs/heyapi/mcp-tools.ts` is a plugin that writes `src/client/mcp.gen.ts`. For each operation it exports one factory, named after the SDK function with `Tool` added, such as `getCatalogsTool`, with the same doc comment as that function. A factory takes an optional `{ client }` and returns `{ name, config, handler }`, the arguments of `McpServer.registerTool`. The handler calls the SDK function with the arguments, the client and the MCP request's abort signal. Without a client, the SDK function uses the package's module level `client`. The file also exports `tools(options)`, every tool in operation order.

The code that is the same for every package is in `specs/heyapi/mcp-tools-support.ts`: the types `Tool`, `ToolConfig` and `OperationMeta`, and the `toToolResult`, `loose`, `dataUriFields` and `decodeDataUris` helpers. The plugin copies it unchanged to `src/client/mcp-support.gen.ts`, and `mcp.gen.ts` imports from it. The file is only type-checked and tested as that copy, in `catalogs/src/mcp-support.test.ts` and, for the upload helpers, through the fixture in `catalogs/test/mcp-plugin.test.ts`, because `specs/` has no `node_modules`. It imports only types from `@modelcontextprotocol/sdk`, so that package is an optional peer.

To add it to a package, add `mcpTools($, { api: "catalogs" })` to the plugins in its `openapi-ts.config.ts`, then add a `src/mcp.ts` and a `./mcp` export like the catalogs package has. `src/mcp.ts` re-exports `mcp.gen.ts` and the three types, but not the helpers.

- `$` is passed in from the config, because `specs/` has no `node_modules` and cannot import it itself.
- `tools(options)` returns `Array<Tool>`, so TypeScript checks every tool's config against `ToolConfig`. The risk in `_meta` is `as const` so it keeps its literal type.
- An operation with a `multipart/form-data` body is a tool. Each top-level body field with `format: binary` takes a `data:` URI string ([RFC 2397](https://www.rfc-editor.org/rfc/rfc2397)), such as `data:text/csv;name=products.csv;base64,…`, and its JSON Schema says `format: uri`. Next to it, an optional `<field>_name` string takes the file's name, as the latest SEP-2356 draft asks, and is not sent to the API. The handler decodes the URI into a `File` with the URI's media type, named from `<field>_name`, else from a `name=` parameter in the URI (accepted for compatibility with the earlier draft), else after the field, and the SDK function sends it as a file part. A URI that is not a `data:` URI, a malformed one, or a file over the limit returns an `isError` result, and nothing is sent. The tool never downloads a URL. Other fields, such as a file's URL for the API to fetch, are sent as they are.
- The plugin throws when the body already has a `<field>_name` property, because the name would have nowhere to go.
- An operation that uploads a file needs an `x-mcp-max-file-bytes` spec override, the largest decoded file the tool accepts, in bytes. The plugin throws when it is missing or is not a whole number above 0. The field's description states the limit, and the field carries `x-mcp-file: { maxSize }`, the file-input marker from the MCP File Uploads Working Group's drafts (SEP-2356 and SEP-2631), so a host that recognises it can offer a file picker.
- Operations with any other non-JSON request body, such as `application/x-www-form-urlencoded`, are not generated as tools.
- The tool name is `<api>_<snake_case_function>`. An `x-mcp-name` spec override replaces it, for a name that would be too long. Operation IDs stay as they are, because they name the SDK functions. The plugin throws when a name, generated or overridden, is longer than 64 characters or has a character outside `[a-zA-Z0-9_-]`.
- The title is the operation's summary. The description is the summary plus the first paragraph of the spec description, so a long spec description does not fill the model's context. The full spec description stays in the factory's doc comment. `x-mcp-title` and `x-mcp-description` spec overrides replace the defaults, and the plugin throws when one is empty. A deprecated operation's description starts with `Deprecated. `, and is not given a second one when the text already starts with "Deprecated".
- A written description follows Anthropic's [tool definition guidance](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools): two to four sentences on what the tool does, when to use it rather than a similar tool, and any caveat that changes when to call it. The words a model would search for come first. It has no markdown or links, and names no other tool, because a consumer can rename tools. Each package's `src/mcp.test.ts` fails when a description is longer than 600 characters.
- The input schema is a strict `z.object` of the operation's `path`, `query`, `headers` and `body` schemas from `zod.gen.ts`. `path`, `query` and `headers` are strict. The `Authorization` header is left out.
- The body is a deep loose copy of its schema, made by the `loose` helper. The MCP SDK passes the handler the parsed arguments, and a zod object that is not loose drops keys it does not list. The zod plugin has no option for loose objects, and changing `zod.gen.ts` would change the `./zod` export.
- The annotations come from a risk tier. The HTTP method sets the tier, and an `x-mcp-risk` spec override replaces it.
- The `x-mcp-*` overrides for an operation go in one file, `specs/overrides/mcp/<package>/<operationId>.yaml`, listed under `operation-property-override` for the API in `specs/config/redocly.yaml`. The decorator takes one file for each operation. `catalogs@v1`, `rule-promotions-standalone@v1`, `cart-checkout-standalone@v1` and `files-standalone@v1` list theirs. A package whose spec had no bundle gets a `<package>-standalone@v1` entry and an `oas:build` script, and generates from the bundle.
- The plugin stays out of the generated `index.ts`, so the main entry does not change.
- Each package that adopts the plugin has a `test/mcp-generation.test.ts`, such as `catalogs/test/mcp-generation.test.ts`. It generates the client twice and compares both with the committed files, so a generator upgrade that changes the output fails the test. `catalogs/test/mcp-plugin.test.ts` generates a small fixture spec for the cases the catalogs spec does not have: a multipart upload, a form-encoded body, an `x-mcp-name` override, deprecated operations, the default and overridden titles and descriptions, an `Authorization` header next to another header, and a function name with a one-letter word, such as `getACart`, which becomes `get_a_cart`.

## Future Updates

We'll update this README with more information as development progresses. Stay tuned for:

- Installation instructions
- Usage examples
- API documentation
- Migration guides from existing SDKs

## Questions?

If you have any questions about these upcoming SDKs, please reach out to our support team or open an issue in this repository.
