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

### `nullableIntersection`

A schema that is `nullable` and a `oneOf`, and also lists shared `properties`, becomes an intersection in the TypeScript types: `(A | B | null) & { type: ... }`. `null & { type }` is never, so the type drops `null`, while the Zod schema puts `.nullable()` outside and accepts it. `nullableIntersection` is a TypeScript resolver that adds `| null` outside the intersection when a member union contains `null`, so the type matches the Zod schema and the API.

- subscriptions uses it. Its update offering plan and update subscriber operations take `null` to remove a feature configuration or the payment authority, and without the resolver a TypeScript caller cannot send it.
- `subscriptions/test/nullable-intersection.test.ts` generates a fixture with the helper and type-checks values against it, so a generator upgrade that changes the output fails the test.

### `mcpTools`

`specs/heyapi/mcp-tools.ts` is a plugin that writes `src/client/mcp.gen.ts`. For each operation it exports one factory, named after the SDK function with `Tool` added, such as `getCatalogsTool`, with the same doc comment as that function. A factory takes an optional `{ client }` and returns `{ name, config, handler }`, the arguments of `McpServer.registerTool`. The handler calls the SDK function with the arguments, the client and the MCP request's abort signal. Without a client, the SDK function uses the package's module level `client`. The file also exports `tools(options)`, every tool in operation order.

The code that is the same for every package is in `specs/heyapi/mcp-tools-support.ts`: the types `Tool`, `ToolConfig` and `OperationMeta`, and the `toToolResult`, `loose`, `withSharedSchemaIds`, `dataUriFields` and `decodeDataUris` helpers. The plugin copies it unchanged to `src/client/mcp-support.gen.ts`, and `mcp.gen.ts` imports from it. The file is only type-checked and tested as that copy, in `catalogs/src/mcp-support.test.ts` and, for the upload helpers, through the fixture in `catalogs/test/mcp-plugin.test.ts`, because `specs/` has no `node_modules`. It imports only types from `@modelcontextprotocol/sdk`, so that package is an optional peer.

To add it to a package, add `mcpTools($, { api: "catalogs" })` to the plugins in its `openapi-ts.config.ts`, then add a `src/mcp.ts` and a `./mcp` export like the catalogs package has. `src/mcp.ts` re-exports `mcp.gen.ts` and the three types, but not the helpers.

- `$` is passed in from the config, because `specs/` has no `node_modules` and cannot import it itself.
- `tools(options)` returns `Array<Tool>`, so TypeScript checks every tool's config against `ToolConfig`. The risk in `_meta` is `as const` so it keeps its literal type.
- An operation with a `multipart/form-data` body is a tool. Each top-level body field with `format: binary` takes a `data:` URI string, such as `data:text/csv;base64,…`, and its JSON Schema says `format: uri`. See [File uploads](#file-uploads) for where the design comes from. Next to it, an optional `<field>_name` string takes the file's name, as the latest SEP-2356 draft asks, and is not sent to the API. The handler decodes the URI into a `File` with the URI's media type, named from `<field>_name`, else from a `name=` parameter in the URI (accepted for compatibility with the earlier draft), else after the field, and the SDK function sends it as a file part. A URI that is not a `data:` URI, a malformed one, or a file over the limit returns an `isError` result, and nothing is sent. The tool never downloads a URL. Other fields, such as a file's URL for the API to fetch, are sent as they are.
- The plugin throws when the body already has a `<field>_name` property, because the name would have nowhere to go.
- An operation that uploads a file needs an `x-mcp-max-file-bytes` spec override, the largest decoded file the tool accepts, in bytes. The plugin throws when it is missing or is not a whole number above 0. The field's description states the limit, and the field carries `x-mcp-file: { maxSize }`, the file-input marker from the MCP File Uploads Working Group's drafts (SEP-2356 and SEP-2631), so a host that recognises it can offer a file picker.
- Operations with any other non-JSON request body, such as `application/x-www-form-urlencoded`, are not generated as tools.
- The tool name is `<api>_<snake_case_function>`. An `x-mcp-name` spec override replaces it, for a name that would be too long. Operation IDs stay as they are, because they name the SDK functions. The plugin throws when a name, generated or overridden, is longer than 64 characters or has a character outside `[a-zA-Z0-9_-]`.
- The title is the operation's summary. The description is the summary plus the first paragraph of the spec description, so a long spec description does not fill the model's context. The full spec description stays in the factory's doc comment. `x-mcp-title` and `x-mcp-description` spec overrides replace the defaults, and the plugin throws when one is empty. A deprecated operation's description starts with `Deprecated. `, and is not given a second one when the text already starts with "Deprecated".
- A written description follows Anthropic's [tool definition guidance](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools): two to four sentences on what the tool does, when to use it rather than a similar tool, and any caveat that changes when to call it. The words a model would search for come first. It has no markdown or links, and names no other tool, because a consumer can rename tools. Each package's `src/mcp.test.ts` fails when a description is longer than 600 characters.
- The input schema is a strict `z.object` of the operation's `path`, `query`, `headers` and `body` schemas from `zod.gen.ts`. `path`, `query` and `headers` are strict. The `Authorization` header is left out.
- The body is a deep loose copy of its schema, made by the `loose` helper. The MCP SDK passes the handler the parsed arguments, and a zod object that is not loose drops keys it does not list. The zod plugin has no option for loose objects, and changing `zod.gen.ts` would change the `./zod` export.
- `loose` makes one copy of each schema it meets in a body, however many places use it, so the copy keeps the sharing that `zod.gen.ts` has. A schema that contains itself, through `z.lazy` or a getter, is copied once and refers to its own copy.
- A large schema that one tool's body uses in more than one place is listed once. `withSharedSchemaIds` gives a copy a Zod registry `id` when the tool's input reaches it more than once, its JSON Schema is at least 1,000 characters, and the id makes the tool's listed JSON Schema shorter. Zod writes a schema with an `id` once, under `definitions`, and puts a `$ref` to it in each place, with the MCP SDK's default options. Below 1,000 characters the saving is small, and each `$ref` is one more step for the model to follow. The id is `<api>_<field name>`, with `_2`, `_3` and so on added when the id is taken, because Zod's registry is one per process and two tools, or a second copy of the module, can have the same field name. The id goes on the tool's copy, never on the schema in `zod.gen.ts`, so the `./zod` export's JSON Schema does not change. The copies are made per tool, so a tool that uses a schema once still lists it in place. A shared schema that is one side of an intersection is listed as `allOf` with a `$ref`, not merged into one object. The accepted values do not change. The cart-checkout-order, commerce-extensions, pricebooks, promotions-standard, rule-promotions and subscriptions packages fail their `src/mcp.test.ts` when the listed input schema of one of their largest tools grows past a set number of characters.
- A client has to resolve a local `$ref` to read such a tool. The MCP spec takes a JSON Schema `inputSchema` with a dialect from `$schema`, and the MCP SDK writes draft-07, so the shared schemas go under `definitions`. Claude's API documents local `$ref`, `$defs` and `definitions` as supported for strict tools, but not `allOf` with `$ref`, which Zod writes for an optional field. Some MCP clients have open reports about `$ref` parameters, so check a client before relying on it.
- The annotations come from a risk tier. The HTTP method sets the tier, and an `x-mcp-risk` spec override replaces it.
- The `x-mcp-*` overrides for an operation go in one file, `specs/overrides/mcp/<package>/<operationId>.yaml`, listed under `operation-property-override` for the API in `specs/config/redocly.yaml`. The decorator takes one file for each operation. `catalogs@v1`, `rule-promotions-standalone@v1`, `cart-checkout-standalone@v1` and `files-standalone@v1` list theirs. A package whose spec had no bundle gets a `<package>-standalone@v1` entry and an `oas:build` script, and generates from the bundle.
- The plugin stays out of the generated `index.ts`, so the main entry does not change.
- Each package that adopts the plugin has a `test/mcp-generation.test.ts`, such as `catalogs/test/mcp-generation.test.ts`. It generates the client twice and compares both with the committed files, so a generator upgrade that changes the output fails the test. `catalogs/test/mcp-plugin.test.ts` generates a small fixture spec for the cases the catalogs spec does not have: a multipart upload, a form-encoded body, an `x-mcp-name` override, deprecated operations, the default and overridden titles and descriptions, an `Authorization` header next to another header, and a function name with a one-letter word, such as `getACart`, which becomes `get_a_cart`, and a body that uses one large schema in two places, a small schema in two places, and a schema that contains itself.

#### File uploads

An operation with a `multipart/form-data` body uploads a file. Its tool takes the file inline, as text the model or host can put in a tool call. This section says where that design comes from and how closely it follows the MCP proposals.

**Sources**

- **The rollout notes on [#735](https://github.com/elasticpath/composable-frontend/issues/735#issuecomment-6216064556)** chose the approach. A file field is a `data:` URI string. The tool checks the size itself and returns an error result when a file is too big. It never fetches a URL the caller gives. Where the API takes a URL, such as the Files API's `file_location`, that field passes through and the API fetches it.
- **[SEP-2356](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2356), Declarative File Inputs for Tools and Elicitation,** from the MCP File Uploads Working Group. It defines the value format and the `x-mcp-file` marker, and this design follows its latest draft. The PR closed without merging on 2026-06-26.
- **[SEP-2631](https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2631), File Objects and Transfer,** builds on SEP-2356. It keeps `data:` URIs for inline files and adds out-of-band uploads, which this design does not use. It closed without merging on 2026-10-14.
- The working group's work now continues in [`experimental-ext-file-uploads`](https://github.com/modelcontextprotocol/experimental-ext-file-uploads), which has no spec text yet. Treat this design as following a draft that may change.
- **[RFC 2397](https://www.rfc-editor.org/rfc/rfc2397)** defines the `data:` URI syntax.
- **[SEP-1303](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/seps/1303-input-validation-errors-as-tool-execution-errors.md)**, which SEP-2356 cites, says to return input validation failures as tool results with `isError` set, so the model can correct them.
- **No implementation to copy.** Elastic Path's own MCP server, `epcc-api-mcp`, handles no uploads. The TypeScript SDK prototype for SEP-2356 ([typescript-sdk#1633](https://github.com/modelcontextprotocol/typescript-sdk/pull/1633)) adds only types.

**What the latest drafts ask for, and what the tool does**

| The drafts                                                                                            | The tool                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A file is a `data:` URI in a `type: string`, `format: uri` field, base64 or percent-encoded           | The same. The media type comes from the URI. A URI with no media type is `text/plain`, RFC 2397's default.                                                                   |
| The field is marked `x-mcp-file`, with optional `accept` and `maxSize`                                | `x-mcp-file: { maxSize }`. `maxSize` comes from the operation's `x-mcp-max-file-bytes` spec override. There is no `accept`, because the specs list file types only in prose. |
| A server that needs the file name declares a separate string argument; `name=` in the URI was dropped | `<field>_name`, such as `file_name`. It names the `File`, and it is not sent to the API.                                                                                     |
| Any scheme other than `data:` is rejected and never dereferenced                                      | The same. A URL in a file field returns an error result.                                                                                                                     |
| `maxSize` is the decoded size; a violation is a tool error naming the field and the constraint        | The same. The size is checked before decoding where possible, and nothing is sent.                                                                                           |

**Where the tool departs from the drafts**

- It still reads a `name=` parameter in the URI, as SEP-2356's earlier draft and the rollout notes described. `<field>_name` takes precedence over it.
- It does not implement SEP-2631's out-of-band uploads (`files/authorizeUpload`, `mcp-file://` URIs, `transferModes`), so a file must fit inline.
- There is no capability negotiation. The latest SEP-2356 draft defines none, so the tools are always listed.

**How it was verified**

- `catalogs/test/mcp-plugin.test.ts` generates a fixture with two upload operations and checks:
  - the multipart request carries the decoded bytes, name and type
  - percent-encoded data
  - a size at and over the limit
  - a malformed URI, invalid base64 and a URL, each sending nothing
  - the precedence of `<field>_name` over `name=`
- `files/src/mcp.test.ts` runs the files upload tool through a real MCP server and client.
- On 2026-10-19, the files tools were run through a real MCP client against an Elastic Path store:
  - An oversized file, a URL and invalid base64 each came back as an error result, and nothing was sent.
  - A PNG was uploaded and read back with the same name, type and size, and its file link returned identical bytes.
  - The file was then deleted, and a read afterwards returned 404.

## Future Updates

We'll update this README with more information as development progresses. Stay tuned for:

- Installation instructions
- Usage examples
- API documentation
- Migration guides from existing SDKs

## Questions?

If you have any questions about these upcoming SDKs, please reach out to our support team or open an issue in this repository.
