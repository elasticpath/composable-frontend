# @epcc-sdk/sdks-files SDK

Below you'll find instructions on how to install, set up, and use the client, along with a list of available operations.


## Features

- type-safe response data and errors
- response data validation and transformation
- access to the original request and response
- granular request and response customization options
- minimal learning curve thanks to extending the underlying technology

---


## Installation

```bash
npm install @epcc-sdk/sdks-files
# or
pnpm install @epcc-sdk/sdks-files
# or
yarn add @epcc-sdk/sdks-files
```

---

## Client Usage


Clients are responsible for sending the actual HTTP requests.

The Fetch client is built as a thin wrapper on top of Fetch API, extending its functionality. If you're already familiar with Fetch, configuring your client will feel like working directly with Fetch API.

You can configure the client in two ways:

- Configuring the internal `client` instance directly
- Using the `createClient` function

**When using the operation function to make requests, by default the global client will be used unless another is provided.**


### 1. Configure the internal `client` instance directly

This is the simpler approach. You can call the setConfig() method at the beginning of your application or anytime you need to update the client configuration. You can pass any Fetch API configuration option to setConfig(), and even your own Fetch implementation.

```ts
import { client } from "@epcc-sdk/sdks-files";

client.setConfig({
// set default base url for requests
baseUrl: 'https://euwest.api.elasticpath.com',

// set default headers for requests
headers: {
Authorization: 'Bearer YOUR_AUTH_TOKEN',
},
});
```

The disadvantage of this approach is that your code may call the client instance before it's configured for the first time. Depending on your use case, you might need to use the second approach.

### 2. Using the `createClient` function

This is useful when you want to use a different instance of the client for different parts of your application or when you want to use different configurations for different parts of your application.

```ts
import { createClient } from "@epcc-sdk/sdks-files";

// Create the client with your API base URL.
const client = createClient({
    // set default base url for requests
    baseUrl: "https://euwest.api.elasticpath.com",
    /**
    * Set default headers only for requests made by this client.
    */
    headers: {
        "Custom-Header": 'My Value',
    },
});
```

You can also pass this instance to any SDK function through the client option. This will override the default instance from `import { client } from "@epcc-sdk/sdks-files>".

```ts
const response = await getAFile({
    client: myClient,
});
```

### Direct configuration

Alternatively, you can pass the client configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```ts
const response = await getAFile({
    baseUrl: 'https://example.com', // <-- override default configuration
});
```

## Interceptors (Middleware)

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. They can be added with use and removed with eject. Below is an example request interceptor

```ts
import { client } from "@epcc-sdk/sdks-files";

// Supports async functions
client.interceptors.request.use(async (request) => {
    // do something
    return request;
});

client.interceptors.request.eject((request) => {
    // do something
    return request;
});

```

and an example response interceptor

```ts
import { client } from "@epcc-sdk/sdks-files";

client.interceptors.response.use((response) => {
    // do something
    return response;
});

client.interceptors.response.eject((response) => {
    // do something
    return response;
});
```

> **_Tip:_** To eject, you must provide a reference to the function that was passed to use().

## Authentication

`createFilesClient` is the short way. It returns a client that holds a caching token
source, sets the `auth` hook, refreshes and replays once on a 401, and backs off on a 429.

```ts
import {
  createFilesClient,
  getAllFiles,
} from "@epcc-sdk/sdks-files";

const client = createFilesClient({
  baseUrl: "https://euwest.api.elasticpath.com",
  clientId: process.env.EPCC_CLIENT_ID!,
  clientSecret: process.env.EPCC_CLIENT_SECRET!,
});

const { data } = await getAllFiles({ client });
```

Credentials come from `source`, `provider`, `token`, `clientId` plus `clientSecret`, or
`clientId` alone for the implicit grant. `retry`, `storage`, `leewaySeconds`, `fetch` and
`config` tune the rest. `config` is merged last, so anything the factory chose can be
overridden.

Pass the client to every operation. The module-level `client` exported by this package
carries no credentials, so an operation called without `{ client }` gets a 401.

To assemble the stack by hand, `createTokenSource`, `createAuthenticatedFetch`,
`createRetryFetch` and `createConfiguredClient` are re-exported from this package, so you
still install only `@epcc-sdk/sdks-files`. Do not authenticate with a request
interceptor: an interceptor cannot see the response, so it can never retry a 401.

## Validation schemas

Zod schemas for every request body, path and response are published under the `/zod`
subpath. `zod` is an optional peer dependency (4.x), so the root entry never imports it.

```ts
import { zFile } from "@epcc-sdk/sdks-files/zod";

const file = zFile.parse(data?.data?.[0]);
```

## MCP endpoint tools

The `/mcp` subpath turns each of the 4 files operations into a Model Context Protocol (MCP) tool.
The main entry imports none of it. `zod` 4 and `@modelcontextprotocol/sdk` are needed only for this
subpath.

Each operation has one tool factory, named after its function with `Tool` added, such as
`getAllFilesTool`. A factory returns `{ name, config, handler }`, the three arguments that
`McpServer.registerTool` takes. `tools()` returns all 4 in operation order. A handler returns an API
error as an `isError` result and does not throw.

Register one tool:

```ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { getAllFilesTool } from "@epcc-sdk/sdks-files/mcp"

const server = new McpServer({ name: "files", version: "1.0.0" })
const tool = getAllFilesTool()
server.registerTool(tool.name, tool.config, tool.handler)
```
A tool built without a client calls through the package's module level `client`, like an operation
does. That client has no credentials until you configure it. Configure it once:

```ts
import { client, createFilesClient } from "@epcc-sdk/sdks-files"

client.setConfig(createFilesClient({ baseUrl, clientId, clientSecret }).getConfig())
```
Register every tool, with a client that sends the same headers on every call:

```ts
import * as files from "@epcc-sdk/sdks-files/mcp"

const client = createFilesClient({
  baseUrl,
  clientId,
  clientSecret,
  config: { headers: { "EP-Store-Id": storeId, "EP-Org-Id": orgId } },
})
files
  .tools({ client })
  .forEach((t) => server.registerTool(t.name, t.config, t.handler))
```
Register the read-only tools only:

```ts
files
  .tools({ client })
  .filter((t) => t.config._meta["com.elasticpath/operation"].risk === "read")
  .forEach((t) => server.registerTool(t.name, t.config, t.handler))
```
Each tool is named `files_<snake_case_function>`, and its arguments are grouped under `path`,
`query`, `headers` and `body`. The `path`, `query` and `headers` groups reject keys the spec does not
list. The `body` keeps them, so an attribute the spec does not list still reaches the API. The client
supplies the `Authorization` header, so no tool asks for it. Cancelling the MCP request cancels the
HTTP request.

`files_create_a_file` uploads a file. Its `file` field takes the file as a `data:` URI, such as
`data:image/png;name=photo.png;base64,iVBORw0KGgo…`. The tool decodes it and sends it with the
type and name from the URI. It accepts a file of at most 8,388,608 bytes (8 MiB), the API's default
limit, and returns an `isError` result for a larger file, a malformed URI, or a URL, without sending
anything. It never downloads a URL. The field carries `x-mcp-file: { maxSize: 8388608 }`, so a host that recognises the MCP file-input marker can offer a file picker. To register a file hosted elsewhere, send its URL in
`file_location`, which the API fetches.

Each tool's description is written for a model choosing between tools: what the tool does, when to
use it rather than a similar tool, and any caveat that changes when to call it, in at most 600
characters. The full spec description stays in the doc comment of the operation's function and its
tool factory.

`config._meta["com.elasticpath/operation"]` holds the operation's `id`, `method`, `path` and `risk`.
The risk is `read`, `create`, `update` or `delete`, and the annotations follow from it.

## Build URL

If you need to access the compiled URL, you can use the buildUrl() method. It's loosely typed by default to accept almost any value; in practice, you will want to pass a type hint.

```ts
type FooData = {
  path: {
    fooId: number;
  };
  query?: {
    bar?: string;
  };
  url: '/foo/{fooId}';
};

const url = client.buildUrl<FooData>({
  path: {
    fooId: 1,
  },
  query: {
    bar: 'baz',
  },
  url: '/foo/{fooId}',
});
console.log(url); // prints '/foo/1?bar=baz'
```


---





## Operation Usage
The following examples demonstrate how to use the operation function to make requests.

```ts
import { getAFile } from "@epcc-sdk/sdks-files";

const product = await getAFile({
  // client: localClient, // optional if you have a client instance you want to use otherwise the global client will be used
  path: {
    ...
  },
  query: {
    ...
  },
});
```

---



## Available Operations



- **`getAllFiles`** (`GET /v2/files`)

- **`createAFile`** (`POST /v2/files`)

- **`deleteAFile`** (`DELETE /v2/files/{fileID}`)

- **`getAFile`** (`GET /v2/files/{fileID}`)




---