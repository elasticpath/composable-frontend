# @epcc-sdk/authentication

A TypeScript client for the token endpoint of Elastic Path Composable Commerce, `POST /oauth/access_token`. The function and types are generated from the OpenAPI spec of the API.

`@epcc-sdk/sdks-runtime` uses this package to get tokens, and each API client package gets tokens through it. Use this package directly only if you need to request a token yourself.

## Installation

```bash
npm install @epcc-sdk/authentication
```

## Quick start

```ts
import { createAnAccessToken, createClient } from "@epcc-sdk/authentication"

const client = createClient({ baseUrl: "https://euwest.api.elasticpath.com" })

const { data, error } = await createAnAccessToken({
  client,
  body: {
    grant_type: "client_credentials",
    client_id: process.env.EPCC_CLIENT_ID!,
    client_secret: process.env.EPCC_CLIENT_SECRET!,
  },
})

const token = data?.access_token
```

Set `baseUrl` to the API host of your region, with no path. For the implicit grant, set `grant_type` to `"implicit"` and do not send `client_secret`.

A failed request does not throw. The function returns the error in `error`.
