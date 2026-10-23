# @epcc-sdk/sdks-accounts SDK

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
npm install @epcc-sdk/sdks-accounts
# or
pnpm install @epcc-sdk/sdks-accounts
# or
yarn add @epcc-sdk/sdks-accounts
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
import { client } from "@epcc-sdk/sdks-accounts";

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
import { createClient } from "@epcc-sdk/sdks-accounts";

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

You can also pass this instance to any SDK function through the client option. This will override the default instance from `import { client } from "@epcc-sdk/sdks-accounts>".

```ts
const response = await getV2Accounts({
    client: myClient,
});
```

### Direct configuration

Alternatively, you can pass the client configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```ts
const response = await getV2Accounts({
    baseUrl: 'https://example.com', // <-- override default configuration
});
```

## Interceptors (Middleware)

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. They can be added with use and removed with eject. Below is an example request interceptor

```ts
import { client } from "@epcc-sdk/sdks-accounts";

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
import { client } from "@epcc-sdk/sdks-accounts";

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

We are working to provide helpers to handle auth easier for you but for now using an interceptor is the easiest method.

```ts
import { client } from "@epcc-sdk/sdks-accounts";

client.interceptors.request.use((request, options) => {
  request.headers.set('Authorization', 'Bearer MY_TOKEN');
  return request;
});
```

## MCP endpoint tools

The `/mcp` subpath turns each of the 28 accounts operations into a Model Context Protocol (MCP) tool
for MCP SDK v2. The main entry imports none of it. `zod` 4 and `@modelcontextprotocol/server` 2 are
needed only for this subpath.

Each operation has one tool factory, named after its function with `Tool` added, such as
`getV2AccountsTool`. A factory returns `{ name, config, handler }`, the three arguments that
`McpServer.registerTool` takes. `tools()` returns all 28 in operation order. A handler returns an API
error as an `isError` result and does not throw.

Register one tool:

```ts
import { McpServer } from "@modelcontextprotocol/server"
import { getV2AccountsTool } from "@epcc-sdk/sdks-accounts/mcp"

const server = new McpServer({ name: "accounts", version: "1.0.0" })
const tool = getV2AccountsTool()
server.registerTool(tool.name, tool.config, tool.handler)
```
A tool built without a client calls through the package's module level `client`, like an operation
does. That client has no credentials until you configure it. Configure it once:

```ts
import { client, createAccountsClient } from "@epcc-sdk/sdks-accounts"

client.setConfig(createAccountsClient({ baseUrl, clientId, clientSecret }).getConfig())
```
Register every tool, with a client that sends the same headers on every call:

```ts
import * as accounts from "@epcc-sdk/sdks-accounts/mcp"

const client = createAccountsClient({
  baseUrl,
  clientId,
  clientSecret,
  config: { headers: { "EP-Store-Id": storeId, "EP-Org-Id": orgId } },
})
accounts
  .tools({ client })
  .forEach((t) => server.registerTool(t.name, t.config, t.handler))
```
Register the read-only tools only:

```ts
accounts
  .tools({ client })
  .filter((t) => t.config._meta["com.elasticpath/operation"].risk === "read")
  .forEach((t) => server.registerTool(t.name, t.config, t.handler))
```
Each tool is named `accounts_<snake_case_function>`, and its arguments are grouped under `path`,
`query`, `headers` and `body`. The `path`, `query` and `headers` groups reject keys the spec does not
list. The `body` keeps them, so an attribute the spec does not list still reaches the API. The client
supplies the `Authorization` header, so no tool asks for it. Cancelling the MCP request cancels the
HTTP request.

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
import { getV2Accounts } from "@epcc-sdk/sdks-accounts";

const product = await getV2Accounts({
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



- **`getV2Accounts`** (`GET /v2/accounts`)

- **`postV2Accounts`** (`POST /v2/accounts`)

- **`deleteV2AccountsAccountId`** (`DELETE /v2/accounts/{accountID}`)

- **`getV2AccountsAccountId`** (`GET /v2/accounts/{accountID}`)

- **`putV2AccountsAccountId`** (`PUT /v2/accounts/{accountID}`)

- **`getV2AccountMembers`** (`GET /v2/account-members`)

- **`getV2AccountMembersAccountMemberId`** (`GET /v2/account-members/{accountMemberID}`)

- **`getV2AccountsAccountIdAccountMemberships`** (`GET /v2/accounts/{accountID}/account-memberships`)

- **`postV2AccountsAccountIdAccountMemberships`** (`POST /v2/accounts/{accountID}/account-memberships`)

- **`getV2AccountMembersAccountMemberIdAccountMemberships`** (`GET /v2/account-members/{accountMemberId}/account-memberships`)

- **`getV2AccountsAccountIdAccountMembershipsUnassignedAccountMembers`** (`GET /v2/accounts/{accountID}/account-memberships/unassigned-account-members`)

- **`deleteV2AccountsAccountIdAccountMembershipsMembershipId`** (`DELETE /v2/accounts/{accountID}/account-memberships/{membershipID}`)

- **`getV2AccountsAccountIdAccountMembershipsMembershipId`** (`GET /v2/accounts/{accountID}/account-memberships/{membershipID}`)

- **`putV2AccountsAccountIdAccountMembershipsMembershipId`** (`PUT /v2/accounts/{accountID}/account-memberships/{membershipID}`)

- **`getV2SettingsAccountMembership`** (`GET /v2/settings/account-membership`)

- **`putV2SettingsAccountMembership`** (`PUT /v2/settings/account-membership`)

- **`getV2SettingsAccountAuthentication`** (`GET /v2/settings/account-authentication`)

- **`putV2SettingsAccountAuthentication`** (`PUT /v2/settings/account-authentication`)

- **`postV2AccountMembersTokens`** (`POST /v2/account-members/tokens`)




---